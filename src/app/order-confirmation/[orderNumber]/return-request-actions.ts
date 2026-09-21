"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { canAccessOrder } from "@/lib/orders";
import { writeAuditLog } from "@/lib/audit-log";
import { getFeedback } from "@/lib/i18n/feedback";

const schema = z.object({ reason: z.string().min(1).max(2000) });

const RETURNABLE_STATUSES = ["paid", "processing", "shipped", "delivered"];

export async function requestReturn(orderNumber: string, _prevState: unknown, formData: FormData) {
  const t = await getFeedback();
  const parsed = schema.safeParse({ reason: formData.get("reason") });
  if (!parsed.success) return { error: t.returnReasonRequired, success: false };

  const [session, order] = await Promise.all([
    auth(),
    db.order.findUnique({ where: { orderNumber }, include: { returnRequests: true } }),
  ]);
  if (!order || !canAccessOrder(order, session)) {
    return { error: t.orderNotFound, success: false };
  }
  if (!RETURNABLE_STATUSES.includes(order.status)) {
    return { error: t.returnNotEligible, success: false };
  }
  if (order.returnRequests.some((r) => r.status !== "rejected")) {
    return { error: t.returnInProgress, success: false };
  }

  const returnRequest = await db.returnRequest.create({
    data: {
      orderId: order.id,
      userId: session?.user?.id ?? null,
      reason: parsed.data.reason,
    },
  });

  if (session?.user) {
    await writeAuditLog({
      userId: session.user.id,
      action: "return_request.create",
      entityType: "ReturnRequest",
      entityId: returnRequest.id,
      after: { orderId: order.id, reason: parsed.data.reason },
    });
  }

  return { error: null, success: true };
}
