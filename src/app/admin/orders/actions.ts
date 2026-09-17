"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaff, requireAdmin } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";
import { sendOrderStatusEmail } from "@/lib/email";
import { getStripe } from "@/lib/stripe";

const STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

const schema = z.object({
  status: z.enum(STATUSES),
  trackingNumber: z.string().max(100).optional(),
});

export async function updateOrderStatus(
  orderNumber: string,
  _prevState: unknown,
  formData: FormData
) {
  const parsed = schema.safeParse({
    status: formData.get("status"),
    trackingNumber: formData.get("trackingNumber") || undefined,
  });
  if (!parsed.success) return { error: "Invalid input" };

  // Refunds are admin-only — staff can update fulfillment status but not
  // touch money (§11.2 least-privilege roles).
  const isRefund = parsed.data.status === "refunded";
  const session = isRefund ? await requireAdmin() : await requireStaff();

  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { payments: true, user: true },
  });
  if (!order) return { error: "Order not found" };

  if (isRefund) {
    const succeededStripePayment = order.payments.find(
      (p) => p.provider === "stripe" && p.status === "succeeded"
    );
    if (succeededStripePayment?.providerTransactionId) {
      try {
        const stripe = await getStripe();
        await stripe.refunds.create({
          payment_intent: succeededStripePayment.providerTransactionId,
        });
        await db.payment.update({
          where: { id: succeededStripePayment.id },
          data: { status: "refunded" },
        });
      } catch (error) {
        return { error: `Refund failed: ${(error as Error).message}` };
      }
    }
    // A succeeded PayPal payment isn't auto-refunded here — the capture id
    // needed for PayPal's refund API isn't captured by the webhook yet.
    // Process it manually in the PayPal dashboard when this applies.
  }

  const updated = await db.order.update({
    where: { id: order.id },
    data: {
      status: parsed.data.status,
      trackingNumber: parsed.data.trackingNumber ?? order.trackingNumber,
    },
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "order.status_update",
    entityType: "Order",
    entityId: order.id,
    before: { status: order.status, trackingNumber: order.trackingNumber },
    after: { status: updated.status, trackingNumber: updated.trackingNumber },
  });

  await sendOrderStatusEmail({
    orderNumber: updated.orderNumber,
    status: updated.status,
    trackingNumber: updated.trackingNumber,
    guestEmail: order.guestEmail,
    user: order.user ? { email: order.user.email } : null,
  });

  redirect(`/admin/orders/${orderNumber}`);
}

// Admin-only (not staff) — this is permanent and touches financial records,
// unlike a status update. Intended for cleaning up test orders; real stores
// should think twice before deleting a paid order's history.
export async function deleteOrder(orderId: string) {
  const session = await requireAdmin();

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) redirect("/admin/orders");

  await db.$transaction([
    // Payment and ReturnRequest don't cascade on Order deletion (no
    // onDelete: Cascade in schema) — deleted explicitly first. OrderItem
    // and Fulfillment do cascade.
    db.payment.deleteMany({ where: { orderId } }),
    db.returnRequest.deleteMany({ where: { orderId } }),
    db.order.delete({ where: { id: orderId } }),
  ]);

  await writeAuditLog({
    userId: session!.user.id,
    action: "order.delete",
    entityType: "Order",
    entityId: orderId,
    before: { orderNumber: order.orderNumber, status: order.status, total: order.total },
  });

  redirect("/admin/orders");
}
