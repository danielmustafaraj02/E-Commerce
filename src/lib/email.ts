import { Resend } from "resend";
import { getStoreSettings } from "@/lib/store-settings";

// Same graceful-degradation pattern as Stripe/PayPal: without a real API
// key this logs instead of throwing, so the rest of the app keeps working
// in dev and the gap is obvious rather than silent. Checks the DB (Admin >
// Settings > Integrations) first, falling back to env vars of the same name.
export async function sendEmail(input: { to: string; subject: string; text: string }) {
  const settings = await getStoreSettings();
  const apiKey = settings.resendApiKey || process.env.RESEND_API_KEY;
  const from = settings.emailFrom || process.env.EMAIL_FROM || "orders@example.com";

  if (!apiKey) {
    console.warn(
      `[email] Resend is not configured — skipping email to ${input.to}: ${input.subject}`
    );
    return;
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({ from, to: input.to, subject: input.subject, text: input.text });
}

const STATUS_MESSAGES: Record<string, string> = {
  paid: "We've received your payment and your order is now being prepared.",
  processing: "Your order is being processed.",
  shipped: "Your order is on its way.",
  delivered: "Your order has been delivered. Enjoy!",
  cancelled: "Your order has been cancelled.",
  refunded: "Your order has been refunded.",
};

export async function sendOrderStatusEmail(order: {
  orderNumber: string;
  status: string;
  trackingNumber: string | null;
  guestEmail: string | null;
  user: { email: string } | null;
}) {
  const to = order.user?.email ?? order.guestEmail;
  if (!to) return;

  const message = STATUS_MESSAGES[order.status] ?? `Your order status changed to ${order.status}.`;
  const tracking = order.trackingNumber ? `\nTracking number: ${order.trackingNumber}` : "";

  await sendEmail({
    to,
    subject: `Order ${order.orderNumber}: ${order.status}`,
    text: `${message}${tracking}\n\nOrder number: ${order.orderNumber}`,
  });
}
