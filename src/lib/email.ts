import { Resend } from "resend";
import { render } from "react-email";
import * as React from "react";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { rateLimit } from "@/lib/rate-limit";
import { VerifyEmail } from "@/emails/verify-email";
import { ResetPasswordEmail } from "@/emails/reset-password";
import { OrderStatusEmail, type OrderStatus } from "@/emails/order-status";
import { emailStrings } from "@/lib/i18n/email-locale";
import { applyTemplate } from "@/lib/i18n/format";

// Resend's free plan caps out at 100/day — this stops just short of that
// account-wide ceiling so a traffic spike (or a bug looping order-status
// emails) can't push the account into a paid plan on its own. One shared
// key across all instances since this is a global account-level budget, not
// a per-user or per-IP limit.
const DAILY_EMAIL_CAP = 80;

// Same graceful-degradation pattern as Stripe/PayPal: without a real API
// key this logs instead of throwing, so the rest of the app keeps working
// in dev and the gap is obvious rather than silent. Checks the DB (Admin >
// Settings > Integrations) first, falling back to env vars of the same name.
export async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const settings = await getStoreSettings();
  const apiKey = settings.resendApiKey || process.env.RESEND_API_KEY;
  const from = settings.emailFrom || process.env.EMAIL_FROM || "orders@example.com";
  // The `from` address (e.g. orders@perlamuranoglass.com) has no real inbox
  // behind it — inbound receiving isn't set up for it. Routing replies to
  // the real, human-monitored contact address (Admin > Settings > General)
  // is what makes "Reply" on an order email actually reach someone.
  const replyTo = settings.contactEmail || undefined;

  if (!apiKey) {
    console.warn(
      `[email] Resend is not configured — skipping email to ${input.to}: ${input.subject}`
    );
    return;
  }

  const { success } = await rateLimit("email:daily-cap", DAILY_EMAIL_CAP, 24 * 60 * 60 * 1000);
  if (!success) {
    console.warn(
      `[email] Daily cap of ${DAILY_EMAIL_CAP} emails reached — skipping email to ${input.to}: ${input.subject}`
    );
    return;
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    ...(input.html ? { html: input.html } : {}),
    ...(replyTo ? { replyTo } : {}),
  });
}

const KNOWN_ORDER_STATUSES = new Set<OrderStatus>([
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

function isKnownOrderStatus(status: string): status is OrderStatus {
  return KNOWN_ORDER_STATUSES.has(status as OrderStatus);
}

export async function sendVerificationEmailMessage(input: {
  to: string;
  verifyUrl: string;
  expiresInHours: number;
  locale?: string | null;
}) {
  const settings = await getStoreSettings();
  const { locale, t } = await emailStrings(input.locale);
  const element = React.createElement(VerifyEmail, {
    t,
    locale,
    storeName: settings.storeName,
    logoUrl: settings.logoUrl,
    primaryColor: settings.primaryColor,
    verifyUrl: input.verifyUrl,
    expiresInHours: input.expiresInHours,
  });
  const [html, text] = await Promise.all([render(element), render(element, { plainText: true })]);

  await sendEmail({
    to: input.to,
    subject: applyTemplate(t.verifySubject, { storeName: settings.storeName }),
    html,
    text,
  });
}

export async function sendPasswordResetEmailMessage(input: {
  to: string;
  resetUrl: string;
  expiresInMinutes: number;
  locale?: string | null;
}) {
  const settings = await getStoreSettings();
  const { locale, t } = await emailStrings(input.locale);
  const element = React.createElement(ResetPasswordEmail, {
    t,
    locale,
    storeName: settings.storeName,
    logoUrl: settings.logoUrl,
    primaryColor: settings.primaryColor,
    resetUrl: input.resetUrl,
    expiresInMinutes: input.expiresInMinutes,
  });
  const [html, text] = await Promise.all([render(element), render(element, { plainText: true })]);

  await sendEmail({
    to: input.to,
    subject: applyTemplate(t.resetSubject, { storeName: settings.storeName }),
    html,
    text,
  });
}

// Plain text on purpose: a security notice should be unmistakable and
// impossible to mistake for marketing.
export async function sendPasswordChangedEmail(to: string, locale?: string | null) {
  const settings = await getStoreSettings();
  const { t } = await emailStrings(locale);
  const contact = settings.contactEmail
    ? applyTemplate(t.pwChangedContact, { email: settings.contactEmail })
    : "";
  await sendEmail({
    to,
    subject: applyTemplate(t.pwChangedSubject, { storeName: settings.storeName }),
    text: applyTemplate(t.pwChangedBody, { storeName: settings.storeName, contact }),
  });
}

export async function sendOrderStatusEmail(order: {
  orderNumber: string;
  status: string;
  trackingNumber: string | null;
  guestEmail: string | null;
  user: { email: string } | null;
}) {
  const to = order.user?.email ?? order.guestEmail;
  if (!to) return;

  const settings = await getStoreSettings();

  // Line items + currency/total + the order's language aren't on the slice of
  // the order the callers already have in hand (webhooks, admin actions, the
  // abandoned-order cron) — fetched fresh here so every call site gets the full
  // receipt, in the customer's language, without having to know what this
  // email needs.
  const fullOrder = await db.order.findUnique({
    where: { orderNumber: order.orderNumber },
    select: {
      total: true,
      currency: true,
      locale: true,
      createdAt: true,
      items: {
        select: {
          productName: true,
          quantity: true,
          unitPrice: true,
          product: { select: { images: { orderBy: { position: "asc" }, take: 1 } } },
        },
      },
    },
  });
  // Orders placed before the language was stored have none: English, formatted
  // the way the store already formatted them.
  const { locale: lang, t } = await emailStrings(fullOrder?.locale ?? "en");
  const formatLocale = fullOrder?.locale ?? settings.defaultLocale;

  // Unknown/custom status values (anything outside the fixed set the
  // template covers) fall back to a plain-text email rather than a
  // half-populated branded one.
  if (!isKnownOrderStatus(order.status)) {
    await sendEmail({
      to,
      subject: applyTemplate(t.orderSubject, {
        orderNumber: order.orderNumber,
        heading: order.status,
      }),
      text: applyTemplate(t.unknownStatusBody, {
        status: order.status,
        orderNumber: order.orderNumber,
      }),
    });
    return;
  }

  const base = settings.siteUrl || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const orderUrl = `${base}/order-confirmation/${order.orderNumber}`;

  const element = React.createElement(OrderStatusEmail, {
    t,
    lang,
    storeName: settings.storeName,
    logoUrl: settings.logoUrl,
    primaryColor: settings.primaryColor,
    orderNumber: order.orderNumber,
    orderDate: new Intl.DateTimeFormat(formatLocale, { dateStyle: "long" }).format(
      fullOrder?.createdAt ?? new Date()
    ),
    status: order.status,
    trackingNumber: order.trackingNumber,
    orderUrl,
    items: (fullOrder?.items ?? []).map((item) => ({
      name: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      imageUrl: item.product.images[0]?.url ?? null,
    })),
    currency: fullOrder?.currency ?? "EUR",
    locale: formatLocale,
    total: fullOrder?.total ?? 0,
    companyLegalName: settings.companyLegalName,
    companyAddress: settings.companyAddress,
    vatNumber: settings.vatNumber,
  });
  const [html, text] = await Promise.all([render(element), render(element, { plainText: true })]);

  await sendEmail({
    to,
    subject: applyTemplate(t.orderSubject, {
      orderNumber: order.orderNumber,
      heading: t.status[order.status].heading,
    }),
    html,
    text,
  });
}
