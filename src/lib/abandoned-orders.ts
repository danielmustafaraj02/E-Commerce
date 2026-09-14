import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { sendEmail, sendOrderStatusEmail } from "@/lib/email";
import { captureError } from "@/lib/monitoring";

// An "abandoned cart" in this schema is just a pending order that never got
// paid — /api/checkout already creates the Order (and reserves stock) before
// payment happens, so there's no separate cart table to track. See §11.3 /
// §13 of the build spec: recovery emails, and — just as important — not
// holding stock hostage forever for a sale that's never coming.
const REMINDER_AFTER_MS =
  (Number(process.env.ABANDONED_ORDER_REMINDER_HOURS) || 1) * 60 * 60 * 1000;
const EXPIRE_AFTER_MS = (Number(process.env.ABANDONED_ORDER_EXPIRE_HOURS) || 48) * 60 * 60 * 1000;

export async function processAbandonedOrders() {
  const now = new Date();
  const settings = await getStoreSettings();

  const reminded = await sendReminders(now, settings.siteUrl);
  const expired = await expireStaleOrders(now);

  return { reminded, expired };
}

async function sendReminders(now: Date, siteUrl: string | null) {
  const candidates = await db.order.findMany({
    where: {
      status: "pending",
      abandonedEmailSentAt: null,
      createdAt: { lte: new Date(now.getTime() - REMINDER_AFTER_MS) },
    },
    include: { user: { select: { email: true } }, items: true },
  });

  let sent = 0;
  for (const order of candidates) {
    const to = order.user?.email ?? order.guestEmail;
    if (!to) continue;

    const resumeUrl = `${siteUrl ?? ""}/order-confirmation/${order.orderNumber}`;
    const itemLines = order.items
      .map((item) => `- ${item.productName} x${item.quantity}`)
      .join("\n");

    try {
      await sendEmail({
        to,
        subject: "You left something in your cart",
        text: `You started an order but haven't finished paying for it yet:\n\n${itemLines}\n\nFinish your order: ${resumeUrl}\n\nOrder number: ${order.orderNumber}`,
      });
      await db.order.update({ where: { id: order.id }, data: { abandonedEmailSentAt: now } });
      sent += 1;
    } catch (error) {
      captureError(error, { scope: "abandoned-order-reminder", orderNumber: order.orderNumber });
    }
  }
  return sent;
}

async function expireStaleOrders(now: Date) {
  const candidates = await db.order.findMany({
    where: { status: "pending", createdAt: { lte: new Date(now.getTime() - EXPIRE_AFTER_MS) } },
    include: {
      items: { include: { product: { select: { id: true, trackInventory: true } } } },
      user: { select: { email: true } },
    },
  });

  let expired = 0;
  for (const order of candidates) {
    try {
      await db.$transaction(async (tx) => {
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
        await tx.order.update({ where: { id: order.id }, data: { status: "cancelled" } });
      });
      await sendOrderStatusEmail({
        orderNumber: order.orderNumber,
        status: "cancelled",
        trackingNumber: null,
        guestEmail: order.guestEmail,
        user: order.user,
      });
      expired += 1;
    } catch (error) {
      captureError(error, { scope: "abandoned-order-expiry", orderNumber: order.orderNumber });
    }
  }
  return expired;
}
