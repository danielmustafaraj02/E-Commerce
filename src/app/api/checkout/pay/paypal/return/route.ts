import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { capturePaypalOrder } from "@/lib/paypal";
import { capturedAmountMatches } from "@/lib/paypal-amount";
import { captureError } from "@/lib/monitoring";

// UX-only fast path: captures immediately so the buyer sees "paid" without
// waiting on the webhook. The webhook (/api/webhooks/paypal) is still the
// authoritative confirmation and applies the same update idempotently.
//
// Both query params are attacker-controlled (this is a plain GET), so neither
// is trusted on its own: the PayPal order id must map to a Payment row we
// created, and that row — not the `orderNumber` param — decides which order
// gets marked paid. Otherwise a buyer could pay for a cheap order and point
// its token at an expensive one.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const paypalOrderId = url.searchParams.get("token");
  const orderNumber = url.searchParams.get("orderNumber");

  if (!paypalOrderId || !orderNumber) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const payment = await db.payment.findUnique({
    where: { providerTransactionId: paypalOrderId },
    include: { order: { select: { id: true, orderNumber: true, total: true, currency: true } } },
  });
  // Checked before capturing, so a token we never issued for this order can't
  // trigger a capture at all.
  if (!payment || payment.provider !== "paypal" || payment.order.orderNumber !== orderNumber) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  const { order } = payment;
  const confirmationUrl = `/order-confirmation/${order.orderNumber}`;

  try {
    const capture = await capturePaypalOrder(paypalOrderId);
    if (capture.status === "COMPLETED") {
      // Defence in depth: the PayPal order was created server-side with this
      // exact amount, so a mismatch should be impossible — if it ever happens
      // it must not silently mark the order paid.
      if (!capturedAmountMatches(capture, { totalCents: order.total, currency: order.currency })) {
        captureError(new Error("PayPal capture amount does not match order total"), {
          scope: "paypal-return-amount-mismatch",
          orderNumber: order.orderNumber,
        });
        return NextResponse.redirect(new URL(confirmationUrl, request.url));
      }

      const status = await db.$transaction(async (tx) => {
        const current = await tx.order.findUnique({ where: { id: order.id } });
        if (!current) return null;
        if (current.status !== "pending") return current.status;

        await tx.order.update({ where: { id: order.id }, data: { status: "paid" } });
        await tx.payment.update({ where: { id: payment.id }, data: { status: "succeeded" } });
        return "paid";
      });

      if (status === "paid") {
        return NextResponse.redirect(new URL(`${confirmationUrl}?paid=1`, request.url));
      }
      // Money was captured but the order is no longer payable (e.g. the
      // abandoned-order cron cancelled it first) — needs a human, not a
      // "payment cancelled" banner.
      captureError(new Error("PayPal capture completed for a non-pending order"), {
        scope: "paypal-return-late-capture",
        orderNumber: order.orderNumber,
        orderStatus: status,
      });
      return NextResponse.redirect(new URL(confirmationUrl, request.url));
    }
  } catch {
    // Fall through — the order stays pending and the webhook or a retry can
    // still confirm it later.
  }

  return NextResponse.redirect(new URL(`${confirmationUrl}?cancelled=1`, request.url));
}
