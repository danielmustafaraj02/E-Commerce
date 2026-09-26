import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { sendEmail, sendOrderStatusEmail } from "@/lib/email";
import { captureError } from "@/lib/monitoring";
import { siteBaseUrl } from "@/lib/site-url";
import { emailStrings } from "@/lib/i18n/email-locale";
import { applyTemplate } from "@/lib/i18n/format";

// An "abandoned cart" in this schema is just a pending order that never got
// paid — /api/checkout already creates the Order (and reserves stock) before
// payment happens, so there's no separate cart table to track. See §11.3 /
// §13 of the build spec: recovery emails, and — just as important — not
// holding stock hostage for a sale that's never coming.
const HOUR_MS = 60 * 60 * 1000;

const REMINDER_AFTER_MS = (Number(process.env.ABANDONED_ORDER_REMINDER_HOURS) || 1) * HOUR_MS;

// How long an unpaid card/PayPal order keeps its stock reserved. Deliberately
// short: anyone can create pending orders, so a long hold lets a handful of
// abandoned or hostile checkouts pin the whole catalog. Stripe sessions are
// created to expire on the same clock (see api/checkout/pay/stripe).
export const ONLINE_HOLD_MS = (Number(process.env.ABANDONED_ORDER_EXPIRE_HOURS) || 2) * HOUR_MS;

// A bank-transfer order is *supposed* to sit pending while the money moves —
// that takes days, not hours — so it gets its own, much longer window instead
// of being cancelled out from under a customer who's about to pay.
export const BANK_TRANSFER_HOLD_MS =
  (Number(process.env.BANK_TRANSFER_HOLD_DAYS) || 5) * 24 * HOUR_MS;

export async function processAbandonedOrders() {
  const now = new Date();
  const settings = await getStoreSettings();

  const reminded = await sendReminders(now, siteBaseUrl(settings));
  const cancelled = await cancelExpiredOrders(now);
  await notifyCancelledOrders(cancelled);

  return { reminded, expired: cancelled.length };
}

async function sendReminders(now: Date, siteUrl: string) {
  const candidates = await db.order.findMany({
    where: {
      status: "pending",
      abandonedEmailSentAt: null,
      createdAt: { lte: new Date(now.getTime() - REMINDER_AFTER_MS) },
      // "You left something in your cart" is wrong for someone who chose bank
      // transfer and is simply waiting for the wire to arrive.
      payments: { none: { provider: "bank_transfer" } },
    },
    include: { user: { select: { email: true } }, items: true },
  });

  let sent = 0;
  for (const order of candidates) {
    const to = order.user?.email ?? order.guestEmail;
    if (!to) continue;

    // The language the order was placed in. Orders from before it was stored
    // get English — never a request's own locale, since this runs from a
    // cron trigger with no meaningful visitor request behind it at all.
    const orderLocale = order.locale ?? "en";
    const resumeUrl = `${siteUrl}/${orderLocale}/order-confirmation/${order.orderNumber}`;
    const itemLines = order.items
      .map((item) => `- ${item.productName} x${item.quantity}`)
      .join("\n");

    try {
      const { t } = await emailStrings(orderLocale);
      await sendEmail({
        to,
        subject: t.abandonedSubject,
        text: applyTemplate(t.abandonedBody, {
          items: itemLines,
          url: resumeUrl,
          orderNumber: order.orderNumber,
        }),
      });
      await db.order.update({ where: { id: order.id }, data: { abandonedEmailSentAt: now } });
      sent += 1;
    } catch (error) {
      captureError(error, { scope: "abandoned-order-reminder", orderNumber: order.orderNumber });
    }
  }
  return sent;
}

export type CancelledOrder = {
  orderNumber: string;
  guestEmail: string | null;
  user: { email: string } | null;
};

// Cancels every unpaid order whose hold has run out and gives its stock (and
// discount use) back. Emails are separate (notifyCancelledOrders) so a caller
// in a customer's request path can send them after responding.
//
// Safe to call from several places at once (the cron and checkout both do):
// each order is *claimed* with a status-guarded update first, so if two
// callers race for the same order only one wins and only one restocks it.
export async function cancelExpiredOrders(now = new Date()): Promise<CancelledOrder[]> {
  const candidates = await db.order.findMany({
    where: {
      status: "pending",
      OR: [
        {
          createdAt: { lte: new Date(now.getTime() - ONLINE_HOLD_MS) },
          payments: { none: { provider: "bank_transfer" } },
        },
        {
          createdAt: { lte: new Date(now.getTime() - BANK_TRANSFER_HOLD_MS) },
          payments: { some: { provider: "bank_transfer" } },
        },
      ],
    },
    include: {
      items: { include: { product: { select: { id: true, trackInventory: true } } } },
      user: { select: { email: true } },
    },
  });

  const cancelled: CancelledOrder[] = [];
  for (const order of candidates) {
    try {
      const claimed = await db.$transaction(async (tx) => {
        const claim = await tx.order.updateMany({
          where: { id: order.id, status: "pending" },
          data: { status: "cancelled" },
        });
        if (claim.count !== 1) return false; // someone else already handled it

        for (const item of order.items) {
          if (!item.product.trackInventory) continue;
          await tx.product.update({
            where: { id: item.product.id },
            data: { stockQty: { increment: item.quantity } },
          });
        }
        if (order.discountCodeId) {
          await tx.discountCode.update({
            where: { id: order.discountCodeId },
            data: { usedCount: { decrement: 1 } },
          });
        }
        return true;
      });
      if (claimed) {
        cancelled.push({
          orderNumber: order.orderNumber,
          guestEmail: order.guestEmail,
          user: order.user,
        });
      }
    } catch (error) {
      captureError(error, { scope: "abandoned-order-expiry", orderNumber: order.orderNumber });
    }
  }
  return cancelled;
}

export async function notifyCancelledOrders(orders: CancelledOrder[]) {
  for (const order of orders) {
    try {
      await sendOrderStatusEmail({
        orderNumber: order.orderNumber,
        status: "cancelled",
        trackingNumber: null,
        guestEmail: order.guestEmail,
        user: order.user,
      });
    } catch (error) {
      captureError(error, {
        scope: "abandoned-order-cancel-email",
        orderNumber: order.orderNumber,
      });
    }
  }
}
