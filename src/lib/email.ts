import { Resend } from "resend";
import { render } from "react-email";
import * as React from "react";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { rateLimit } from "@/lib/rate-limit";
import { captureError } from "@/lib/monitoring";
import { VerifyEmail } from "@/emails/verify-email";
import { ResetPasswordEmail } from "@/emails/reset-password";
import { OrderStatusEmail, type OrderStatus } from "@/emails/order-status";
import { emailStrings } from "@/lib/i18n/email-locale";
import { applyTemplate } from "@/lib/i18n/format";
import { siteBaseUrl } from "@/lib/site-url";
import { emailAbsoluteUrl, emailThumbnailUrl } from "@/lib/email-image";
import { getGiftVoucherCopy } from "@/lib/gift-voucher-copy";
import { formatMoney } from "@/lib/format";
import { locales, type Locale } from "@/lib/i18n/locale-constants";
import type { GiftVoucher } from "@prisma/client";

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
  const { error } =
    (await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      ...(input.html ? { html: input.html } : {}),
      ...(replyTo ? { replyTo } : {}),
    })) ?? {};
  // Resend's SDK returns { data, error } rather than throwing on an API-level
  // rejection (bad key, unverified sending domain, etc.), so this was
  // previously silent — every caller believed the send succeeded. Reported,
  // not thrown: callers already treat email as best-effort (see registerUser,
  // sendPasswordChangedEmail) and a webhook handler shouldn't 500 just
  // because a receipt email failed to send.
  if (error) {
    captureError(new Error(`Resend rejected an email: ${error.message}`), {
      to: input.to,
      subject: input.subject,
      resendErrorName: error.name,
    });
  }
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
    logoUrl: emailAbsoluteUrl(settings.logoUrl, siteBaseUrl(settings)),
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
    logoUrl: emailAbsoluteUrl(settings.logoUrl, siteBaseUrl(settings)),
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
    subject: applyTemplate(t.pwChangedSubject, {
      storeName: settings.storeName,
    }),
    text: applyTemplate(t.pwChangedBody, {
      storeName: settings.storeName,
      contact,
    }),
  });
}

function escapeEmailHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendGiftVoucherEmail(voucher: GiftVoucher, locale?: string | null) {
  const settings = await getStoreSettings();
  const lang: Locale = (locales as readonly string[]).includes(locale ?? "")
    ? (locale as Locale)
    : "en";
  const copy = getGiftVoucherCopy(lang);
  const amount = formatMoney(voucher.originalAmount, voucher.currency, lang);
  const sender = (voucher.senderName ?? "").replace(/[\r\n\t]+/g, " ").trim() || settings.storeName;
  const subject = copy.emailSubject.replace("{sender}", sender).replace("{amount}", amount);
  const intro = copy.emailIntro.replace("{sender}", sender).replace("{amount}", amount);
  const shopUrl = `${siteBaseUrl(settings)}/${lang}/products`;
  const message = voucher.message?.trim()
    ? `<div style="margin:24px 0;padding:18px 20px;border-left:2px solid #b89a62;color:#435654;line-height:1.7">${escapeEmailHtml(voucher.message).replace(/\n/g, "<br />")}</div>`
    : "";
  const recipient = voucher.recipientName?.trim()
    ? `<p style="margin:0 0 12px;color:#435654">${escapeEmailHtml(voucher.recipientName.trim())},</p>`
    : "";
  const html = `<!doctype html><html><body style="margin:0;background:#f4f0e7;color:#123d43;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fffdfa;border:1px solid #d8cdb8"><tr><td style="padding:38px 34px 34px"><p style="margin:0 0 24px;color:#8a7147;font-size:11px;letter-spacing:3px;text-transform:uppercase">${escapeEmailHtml(settings.storeName)} · MURANO</p><h1 style="margin:0 0 18px;font-family:Georgia,serif;font-size:30px;font-weight:400;line-height:1.25">${escapeEmailHtml(copy.emailTitle)}</h1>${recipient}<p style="margin:0;color:#435654;line-height:1.7">${escapeEmailHtml(intro)}</p>${message}<p style="margin:28px 0 8px;color:#8a7147;font-size:11px;letter-spacing:1.6px;text-transform:uppercase">${escapeEmailHtml(copy.emailCode)}</p><div style="padding:15px 16px;border:1px solid #b89a62;background:#fdfbf6;text-align:center;font-family:monospace;font-size:18px;letter-spacing:1.4px;overflow-wrap:anywhere">${escapeEmailHtml(voucher.code)}</div><p style="margin:16px 0 0;color:#435654"><strong>${escapeEmailHtml(copy.emailBalance)}:</strong> ${escapeEmailHtml(amount)}</p><p style="margin:20px 0 0;color:#435654;font-size:14px;line-height:1.7">${escapeEmailHtml(copy.emailRedeem)}</p><p style="margin:14px 0 0;color:#687775;font-size:12px;line-height:1.7">${escapeEmailHtml(copy.balanceTerms)}</p><p style="margin:28px 0 0"><a href="${escapeEmailHtml(shopUrl)}" style="display:inline-block;padding:13px 19px;background:#123d43;color:#fff;text-decoration:none;font-size:11px;letter-spacing:1.5px;text-transform:uppercase">${escapeEmailHtml(copy.emailButton)}</a></p></td></tr></table></td></tr></table></body></html>`;
  const text = [
    copy.emailTitle,
    "",
    voucher.recipientName?.trim() ? `${voucher.recipientName.trim()},` : "",
    intro,
    voucher.message?.trim() ? `\n${voucher.message.trim()}` : "",
    "",
    `${copy.emailCode}: ${voucher.code}`,
    `${copy.emailBalance}: ${amount}`,
    "",
    copy.emailRedeem,
    copy.balanceTerms,
    shopUrl,
  ]
    .filter(Boolean)
    .join("\n");

  await sendEmail({ to: voucher.recipientEmail, subject, html, text });
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
      giftVoucherPurchaseAmount: true,
      giftVoucherRedeemedAmount: true,
      items: {
        select: {
          productName: true,
          quantity: true,
          unitPrice: true,
          product: {
            select: { images: { orderBy: { position: "asc" }, take: 1 } },
          },
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

  const base = siteBaseUrl(settings);
  const orderUrl = `${base}/${lang}/order-confirmation/${order.orderNumber}`;

  const element = React.createElement(OrderStatusEmail, {
    t,
    lang,
    storeName: settings.storeName,
    logoUrl: emailAbsoluteUrl(settings.logoUrl, siteBaseUrl(settings)),
    primaryColor: settings.primaryColor,
    orderNumber: order.orderNumber,
    orderDate: new Intl.DateTimeFormat(formatLocale, {
      dateStyle: "long",
    }).format(fullOrder?.createdAt ?? new Date()),
    status: order.status,
    trackingNumber: order.trackingNumber,
    orderUrl,
    items: [
      ...(fullOrder?.items ?? []).map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        imageUrl: emailThumbnailUrl(item.product.images[0]?.url, base),
      })),
      ...(fullOrder?.giftVoucherPurchaseAmount
        ? [
            {
              name: getGiftVoucherCopy(lang as Locale).purchaseLabel,
              quantity: 1,
              unitPrice: fullOrder.giftVoucherPurchaseAmount,
              imageUrl: null,
            },
          ]
        : []),
      ...(fullOrder?.giftVoucherRedeemedAmount
        ? [
            {
              name: getGiftVoucherCopy(lang as Locale).voucherApplied,
              quantity: 1,
              unitPrice: -fullOrder.giftVoucherRedeemedAmount,
              imageUrl: null,
            },
          ]
        : []),
    ],
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

export async function sendOrderAndGiftVoucherEmails(
  order: Parameters<typeof sendOrderStatusEmail>[0],
  voucher?: GiftVoucher | null,
  locale?: string | null
) {
  const sends = [
    sendOrderStatusEmail(order).catch((error) => {
      captureError(error, {
        scope: "order-status-email",
        orderNumber: order.orderNumber,
      });
    }),
  ];
  if (voucher) {
    sends.push(
      sendGiftVoucherEmail(voucher, locale).catch((error) => {
        captureError(error, {
          scope: "gift-voucher-email",
          orderNumber: order.orderNumber,
        });
      })
    );
  }
  await Promise.all(sends);
}
