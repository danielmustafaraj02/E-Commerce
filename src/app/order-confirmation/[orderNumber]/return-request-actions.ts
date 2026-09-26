"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { canAccessOrder } from "@/lib/orders";
import { writeAuditLog } from "@/lib/audit-log";
import { getFeedback } from "@/lib/i18n/feedback";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({ reason: z.string().min(1).max(2000) });

const RETURNABLE_STATUSES = ["paid", "processing", "shipped", "delivered"];

export async function requestReturn(orderNumber: string, _prevState: unknown, formData: FormData) {
  const t = await getFeedback();

  // A guest order's orderNumber is its only access token (see lib/orders.ts),
  // and the order-confirmation page rate-limits lookups per IP for exactly
  // that reason — but this action is its own POST target, callable directly
  // without ever loading that page, so it needs the same guard or it becomes
  // an unthrottled way to probe order numbers.
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success: withinLimit } = await rateLimit(`return-request:${ip}`, 10, 60_000);
  if (!withinLimit) return { error: t.orderNotFound, success: false };

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
