import { sendOrderStatusEmail } from "@/lib/email";
import { captureError } from "@/lib/monitoring";
import type { PaidOrder } from "@/lib/order-payment";

/**
 * The emails an order gets once a payment provider confirms it: the "paid"
 * status email and, when the order bought a gift voucher, the voucher itself.
 * Shared by the Stripe and PayPal webhooks and the PayPal return route.
 *
 * Called outside the payment transaction (a slow email provider shouldn't hold
 * it open), and never throws: the order is already correctly marked paid, and
 * since a retry finds it no longer "pending" and skips re-sending, an email
 * failure must not fail the handler — that would only make the provider retry
 * a webhook that can never send the email anyway. Failures are reported as
 * `<scope>-order-email` and `<scope>-gift-voucher-email`.
 */
export async function sendPaidOrderEmails(order: PaidOrder, scope: string) {
  try {
    await sendOrderStatusEmail({
      orderNumber: order.orderNumber,
      status: "paid",
      trackingNumber: order.trackingNumber,
      guestEmail: order.guestEmail,
      user: order.user,
    });
  } catch (error) {
    captureError(error, { scope: `${scope}-order-email`, orderNumber: order.orderNumber });
  }
  if (order.giftVoucherIssue) {
    try {
      const { sendGiftVoucherEmail } = await import("@/lib/email");
      await sendGiftVoucherEmail(order.giftVoucherIssue, order.locale);
    } catch (error) {
      captureError(error, { scope: `${scope}-gift-voucher-email`, orderNumber: order.orderNumber });
    }
  }
}
