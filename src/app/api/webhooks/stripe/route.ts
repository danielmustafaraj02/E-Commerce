import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";
import { captureError } from "@/lib/monitoring";

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

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderNumber = session.metadata?.orderNumber;

      if (orderNumber && session.payment_status === "paid") {
        await db.$transaction(async (tx) => {
          const order = await tx.order.findUnique({ where: { orderNumber } });
          if (!order || order.status !== "pending") return;

          await tx.order.update({ where: { id: order.id }, data: { status: "paid" } });
          await tx.payment.updateMany({
            where: { orderId: order.id, provider: "stripe", providerTransactionId: session.id },
            data: {
              status: "succeeded",
              providerTransactionId:
                typeof session.payment_intent === "string" ? session.payment_intent : session.id,
            },
          });
        });
      }
    }
  } catch (error) {
    // Signature already verified above — this is a processing failure, not a
    // forged webhook. Report it and 500 so Stripe retries the delivery.
    captureError(error, { scope: "stripe-webhook", eventType: event.type });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
