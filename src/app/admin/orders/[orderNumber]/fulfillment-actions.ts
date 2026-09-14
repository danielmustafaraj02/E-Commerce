"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";
import { sendEmail } from "@/lib/email";

// Groups this order's not-yet-sent items for one supplier into a Fulfillment
// record and emails the supplier what to ship and where. The email send
// degrades gracefully (logs instead of throwing) if RESEND_API_KEY isn't
// configured, same as every other outbound-email path in the app.
export async function sendToSupplier(orderNumber: string, supplierId: string) {
  const session = await requireStaff();

  const order = await db.order.findUnique({ where: { orderNumber }, include: { address: true } });
  if (!order) return;

  const [supplier, items] = await Promise.all([
    db.supplier.findUnique({ where: { id: supplierId } }),
    db.orderItem.findMany({ where: { orderId: order.id, supplierId, fulfillmentId: null } }),
  ]);
  if (!supplier || items.length === 0) return;

  const fulfillment = await db.fulfillment.create({
    data: {
      orderId: order.id,
      supplierId: supplier.id,
      status: "sent",
      sentAt: new Date(),
      items: { connect: items.map((item) => ({ id: item.id })) },
    },
  });

  if (supplier.email) {
    const itemLines = items.map((item) => `${item.quantity} x ${item.productName}`).join("\n");
    const shipTo = order.address
      ? `${order.address.fullName}\n${order.address.street}\n${order.address.city}, ${order.address.postalCode} ${order.address.country}`
      : "No address on file";

    await sendEmail({
      to: supplier.email,
      subject: `Fulfillment request — order ${order.orderNumber}`,
      text: `Please ship the following to the customer:\n\n${itemLines}\n\nShip to:\n${shipTo}\n\nOrder reference: ${order.orderNumber}`,
    });
  }

  await writeAuditLog({
    userId: session!.user.id,
    action: "fulfillment.send",
    entityType: "Fulfillment",
    entityId: fulfillment.id,
    after: { orderId: order.id, supplierId, itemCount: items.length },
  });

  redirect(`/admin/orders/${orderNumber}`);
}

const trackingSchema = z.object({
  status: z.enum(["sent", "shipped", "delivered"]),
  trackingNumber: z.string().max(100).optional(),
});

export async function updateFulfillment(
  orderNumber: string,
  fulfillmentId: string,
  _prevState: unknown,
  formData: FormData
) {
  const session = await requireStaff();

  const parsed = trackingSchema.safeParse({
    status: formData.get("status"),
    trackingNumber: formData.get("trackingNumber") || undefined,
  });
  if (!parsed.success) return { error: "Invalid input" };

  const before = await db.fulfillment.findUnique({ where: { id: fulfillmentId } });
  if (!before) return { error: "Fulfillment not found" };

  const fulfillment = await db.fulfillment.update({
    where: { id: fulfillmentId },
    data: {
      status: parsed.data.status,
      trackingNumber: parsed.data.trackingNumber ?? before.trackingNumber,
    },
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "fulfillment.update",
    entityType: "Fulfillment",
    entityId: fulfillment.id,
    before: { status: before.status, trackingNumber: before.trackingNumber },
    after: { status: fulfillment.status, trackingNumber: fulfillment.trackingNumber },
  });

  redirect(`/admin/orders/${orderNumber}`);
}
