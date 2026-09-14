import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { capturePaypalOrder } from "@/lib/paypal";

// UX-only fast path: captures immediately so the buyer sees "paid" without
// waiting on the webhook. The webhook (/api/webhooks/paypal) is still the
// authoritative confirmation and applies the same update idempotently.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const paypalOrderId = url.searchParams.get("token");
  const orderNumber = url.searchParams.get("orderNumber");

  if (!paypalOrderId || !orderNumber) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const capture = await capturePaypalOrder(paypalOrderId);
    if (capture.status === "COMPLETED") {
      await db.$transaction(async (tx) => {
        const order = await tx.order.findUnique({ where: { orderNumber } });
        if (!order || order.status !== "pending") return;

        await tx.order.update({ where: { id: order.id }, data: { status: "paid" } });
        await tx.payment.updateMany({
          where: { orderId: order.id, provider: "paypal", providerTransactionId: paypalOrderId },
          data: { status: "succeeded" },
        });
      });
      return NextResponse.redirect(
        new URL(`/order-confirmation/${orderNumber}?paid=1`, request.url)
      );
    }
  } catch {
    // Fall through — the order stays pending and the webhook or a retry can
    // still confirm it later.
  }

  return NextResponse.redirect(
    new URL(`/order-confirmation/${orderNumber}?cancelled=1`, request.url)
  );
}
