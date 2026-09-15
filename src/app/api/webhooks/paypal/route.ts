import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPaypalWebhookSignature } from "@/lib/paypal";
import { captureError } from "@/lib/monitoring";
import { sendOrderStatusEmail } from "@/lib/email";

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
    const paypalOrderId: string | undefined =
      event.resource?.supplementary_data?.related_ids?.order_id ??
      (event.event_type === "CHECKOUT.ORDER.APPROVED" ? event.resource?.id : undefined);

    const relevantEvent =
      event.event_type === "PAYMENT.CAPTURE.COMPLETED" ||
      event.event_type === "CHECKOUT.ORDER.APPROVED";

    if (paypalOrderId && relevantEvent) {
      const payment = await db.payment.findFirst({
        where: { provider: "paypal", providerTransactionId: paypalOrderId },
      });

      if (payment) {
        const paidOrder = await db.$transaction(async (tx) => {
          const order = await tx.order.findUnique({
            where: { id: payment.orderId },
            include: { user: { select: { email: true } } },
          });
          if (!order || order.status !== "pending") return null;

          await tx.order.update({ where: { id: order.id }, data: { status: "paid" } });
          await tx.payment.update({ where: { id: payment.id }, data: { status: "succeeded" } });
          return order;
        });

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
            captureError(error, { scope: "paypal-webhook-email", orderNumber: paidOrder.orderNumber });
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
