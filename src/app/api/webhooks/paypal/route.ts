import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPaypalWebhookSignature } from "@/lib/paypal";
import { captureError } from "@/lib/monitoring";
import { sendOrderStatusEmail } from "@/lib/email";
import { applyPaidToOrder } from "@/lib/order-payment";

export async function POST(request: Request) {
  const rawBody = await request.text();

  let verified = false;
  try {
    verified = await verifyPaypalWebhookSignature(request.headers, rawBody);
  } catch {
    verified = false;
  }
  if (!verified) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  try {
    const event = JSON.parse(rawBody);
    // Only a completed *capture* means money moved. CHECKOUT.ORDER.APPROVED
    // just says the buyer agreed on PayPal's page — with intent CAPTURE the
    // funds are only taken by the capture call afterwards (see
    // checkout/pay/paypal/return), which can still fail (insufficient funds,
    // risk decline). Treating "approved" as "paid" would ship unpaid orders.
    const paypalOrderId: string | undefined =
      event.resource?.supplementary_data?.related_ids?.order_id;

    if (paypalOrderId && event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const payment = await db.payment.findFirst({
        where: { provider: "paypal", providerTransactionId: paypalOrderId },
      });

      if (payment) {
        // The capture event states how much PayPal actually collected; it
        // must be compared against the order total, so a payload without a
        // usable amount is reported rather than trusted.
        const capturedValue = Number(event.resource?.amount?.value);
        const capturedCurrency: string | undefined = event.resource?.amount?.currency_code;
        if (!Number.isFinite(capturedValue) || !capturedCurrency) {
          captureError(new Error("PayPal capture event has no usable amount"), {
            scope: "paypal-webhook-missing-amount",
            paypalOrderId,
          });
          return NextResponse.json({ received: true });
        }
        const paid = { amount: Math.round(capturedValue * 100), currency: capturedCurrency };

        const applied = await db.$transaction(async (tx) => {
          const result = await applyPaidToOrder(tx, { id: payment.orderId }, paid);
          // Same rule as the Stripe webhook: once the money is really in,
          // record it on the Payment row even if the order couldn't be paid.
          if (
            result.outcome === "paid" ||
            result.outcome === "already_settled" ||
            result.outcome === "paid_after_cancel"
          ) {
            await tx.payment.update({ where: { id: payment.id }, data: { status: "succeeded" } });
          }
          return result;
        });

        // Needs a person, and a retry can't change the outcome — report it
        // but answer 200 rather than making PayPal redeliver.
        if (applied.outcome !== "paid" && applied.outcome !== "already_settled") {
          captureError(new Error(`PayPal payment needs manual review: ${applied.outcome}`), {
            scope: "paypal-webhook-unsettled-payment",
            paypalOrderId,
            outcome: applied.outcome,
          });
        }
        const paidOrder = applied.outcome === "paid" ? applied.order : null;

        // Outside the transaction and in its own try/catch — see the Stripe
        // webhook for why an email failure must not fail this handler.
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
            captureError(error, {
              scope: "paypal-webhook-email",
              orderNumber: paidOrder.orderNumber,
            });
          }
        }
      }
    }
  } catch (error) {
    // Signature already verified above — this is a processing failure, not a
    // forged webhook. Report it and 500 so PayPal retries the delivery.
    captureError(error, { scope: "paypal-webhook" });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
