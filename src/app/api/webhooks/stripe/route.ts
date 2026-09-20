import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";
import { captureError } from "@/lib/monitoring";
import { sendOrderStatusEmail } from "@/lib/email";
import { applyPaidToOrder } from "@/lib/order-payment";

// The only place an order is trusted to actually be paid — never rely on
// the client-side redirect alone (a buyer can close the tab, spoof the
// success URL, etc.).
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = await getStripeWebhookSecret();
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = (await getStripe()).webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      { error: `Invalid signature: ${(error as Error).message}` },
      { status: 400 }
    );
  }

  // Shared by both completion events: `checkout.session.completed` covers
  // synchronous methods (cards, wallets), where payment_status is already
  // "paid" by the time this fires. Delayed methods (SEPA Debit, other bank
  // debits, some local methods enabled from the Dashboard) instead complete
  // the session with payment_status "unpaid" and only report success later
  // via `checkout.session.async_payment_succeeded` — without handling that
  // second event, those orders would sit "pending" forever despite being paid.
  async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
    const orderNumber = session.metadata?.orderNumber;
    if (!orderNumber || session.payment_status !== "paid") return;

    const applied = await db.$transaction(async (tx) => {
      const result = await applyPaidToOrder(
        tx,
        { orderNumber },
        session.amount_total !== null && session.currency
          ? { amount: session.amount_total, currency: session.currency }
          : undefined
      );

      // Money really was collected in all three of these, so record it on the
      // Payment row even when the order itself couldn't be marked paid —
      // otherwise a paid-after-cancel order would show no trace of the money.
      if (
        result.outcome === "paid" ||
        result.outcome === "already_settled" ||
        result.outcome === "paid_after_cancel"
      ) {
        await tx.payment.updateMany({
          where: {
            orderId: result.order.id,
            provider: "stripe",
            providerTransactionId: session.id,
          },
          data: {
            status: "succeeded",
            providerTransactionId:
              typeof session.payment_intent === "string" ? session.payment_intent : session.id,
          },
        });
      }
      return result;
    });

    // These need a person, and retrying the webhook can't change the outcome —
    // so report them loudly but answer 200 instead of making Stripe retry.
    if (applied.outcome !== "paid" && applied.outcome !== "already_settled") {
      captureError(new Error(`Stripe payment needs manual review: ${applied.outcome}`), {
        scope: "stripe-webhook-unsettled-payment",
        orderNumber,
        sessionId: session.id,
        outcome: applied.outcome,
      });
    }
    const paidOrder = applied.outcome === "paid" ? applied.order : null;

    // Outside the transaction (a slow email provider shouldn't hold it
    // open) and in its own try/catch: the order is already correctly
    // marked paid, and since a retry will find it no longer "pending"
    // and skip re-sending, an email failure must not 500 this handler —
    // that would just make Stripe retry a webhook that can never send
    // the email anyway.
    if (paidOrder) {
      try {
        await sendOrderStatusEmail({
          orderNumber: paidOrder.orderNumber,
          status: "paid",
          trackingNumber: paidOrder.trackingNumber,
          guestEmail: paidOrder.guestEmail,
          user: paidOrder.user,
        });
      } catch (error) {
        captureError(error, { scope: "stripe-webhook-email", orderNumber: paidOrder.orderNumber });
      }
    }
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      await fulfillCheckoutSession(event.data.object as Stripe.Checkout.Session);
    }
  } catch (error) {
    // Signature already verified above — this is a processing failure, not a
    // forged webhook. Report it and 500 so Stripe retries the delivery.
    captureError(error, { scope: "stripe-webhook", eventType: event.type });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
