import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { capturePaypalOrder } from "@/lib/paypal";
import { capturedAmount, capturedAmountMatches } from "@/lib/paypal-amount";
import { captureError } from "@/lib/monitoring";
import { applyPaidToOrder } from "@/lib/order-payment";
import { sendOrderStatusEmail } from "@/lib/email";

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
    include: {
      order: {
        select: { id: true, orderNumber: true, total: true, currency: true },
      },
    },
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
      const paid = capturedAmount(capture);
      // Defence in depth: the PayPal order was created server-side with this
      // exact amount, so a mismatch should be impossible — if it ever happens
      // it must not silently mark the order paid.
      if (
        !paid ||
        !capturedAmountMatches(capture, {
          totalCents: order.total,
          currency: order.currency,
        })
      ) {
        captureError(new Error("PayPal capture amount does not match order total"), {
          scope: "paypal-return-amount-mismatch",
          orderNumber: order.orderNumber,
        });
        return NextResponse.redirect(new URL(`${confirmationUrl}?paymentError=1`, request.url));
      }

      const applied = await db.$transaction(async (tx) => {
        const result = await applyPaidToOrder(
          tx,
          { id: order.id },
          { amount: paid.amount, currency: paid.currency }
        );
        if (
          result.outcome === "paid" ||
          result.outcome === "already_settled" ||
          result.outcome === "paid_after_cancel"
        ) {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: "succeeded" },
          });
        }
        return result;
      });

      if (
        applied.outcome === "paid" ||
        (applied.outcome === "already_settled" && applied.order.status !== "cancelled")
      ) {
        if (applied.outcome === "paid") {
          try {
            const emailOrder = {
              orderNumber: applied.order.orderNumber,
              status: "paid",
              trackingNumber: applied.order.trackingNumber,
              guestEmail: applied.order.guestEmail,
              user: applied.order.user,
            };
            try {
              await sendOrderStatusEmail(emailOrder);
            } catch (error) {
              captureError(error, {
                scope: "paypal-return-order-email",
                orderNumber: order.orderNumber,
              });
            }
            if (applied.order.giftVoucherIssue) {
              try {
                const { sendGiftVoucherEmail } = await import("@/lib/email");
                await sendGiftVoucherEmail(applied.order.giftVoucherIssue, applied.order.locale);
              } catch (error) {
                captureError(error, {
                  scope: "paypal-return-gift-voucher-email",
                  orderNumber: order.orderNumber,
                });
              }
            }
          } catch (error) {
            captureError(error, {
              scope: "paypal-return-email",
              orderNumber: order.orderNumber,
            });
          }
        }
        return NextResponse.redirect(new URL(`${confirmationUrl}?paid=1`, request.url));
      }
      // Money was captured but the order is no longer payable (e.g. the
      // abandoned-order cron cancelled it first) — needs a human, not a
      // "payment cancelled" banner.
      captureError(new Error("PayPal capture completed for a non-pending order"), {
        scope: "paypal-return-late-capture",
        orderNumber: order.orderNumber,
        outcome: applied.outcome,
        orderStatus:
          applied.outcome === "paid_after_cancel"
            ? "cancelled"
            : applied.outcome === "already_settled"
              ? applied.order.status
              : null,
      });
      return NextResponse.redirect(new URL(`${confirmationUrl}?paymentError=1`, request.url));
    }
  } catch {
    // The order stays pending and the payment can be retried. PayPal's actual
    // cancel URL is separate, so a capture failure must not look like a cancel.
  }

  return NextResponse.redirect(new URL(`${confirmationUrl}?paymentError=1`, request.url));
}
