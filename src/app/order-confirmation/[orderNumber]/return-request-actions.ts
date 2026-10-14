"use server";

import { captureError } from "@/lib/monitoring";
import { sendEmail } from "@/lib/email";
import { getLocale } from "@/lib/i18n/locale";
import { withdrawalCopy } from "@/lib/withdrawal-copy";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { canAccessOrder } from "@/lib/orders";
import { writeAuditLog } from "@/lib/audit-log";
import { getFeedback } from "@/lib/i18n/feedback";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.email().max(254),
  reason: z.string().trim().max(2000),
});

const RETURNABLE_STATUSES = ["paid", "processing", "shipped", "delivered"];

export async function requestReturn(
  orderNumber: string,
  _prevState: unknown,
  formData: FormData
): Promise<{ error: string | null; success: boolean; receipt?: string; emailSent?: boolean }> {
  const t = await getFeedback();

  // A guest order's orderNumber is its only access token (see lib/orders.ts),
  // and the order-confirmation page rate-limits lookups per IP for exactly
  // that reason — but this action is its own POST target, callable directly
  // without ever loading that page, so it needs the same guard or it becomes
  // an unthrottled way to probe order numbers.
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success: withinLimit } = await rateLimit(`return-request:${ip}`, 10, 60_000);
  if (!withinLimit) return { error: t.orderNotFound, success: false };

  const copy = withdrawalCopy(await getLocale());
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    reason: formData.get("reason") ?? "",
  });
  if (!parsed.success) return { error: copy.invalid, success: false };

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

  const transmittedAt = new Date();
  const receipt = `${copy.statement} ${orderNumber}\n${copy.name}: ${parsed.data.name}\n${copy.email}: ${parsed.data.email}\nUTC: ${transmittedAt.toISOString()}\n${copy.reason}: ${parsed.data.reason}`;
  const returnRequest = await db.returnRequest.create({
    data: {
      orderId: order.id,
      userId: session?.user?.id ?? null,
      reason: receipt,
      createdAt: transmittedAt,
    },
  });

  if (session?.user) {
    await writeAuditLog({
      userId: session.user.id,
      action: "return_request.create",
      entityType: "ReturnRequest",
      entityId: returnRequest.id,
      after: { orderId: order.id, reason: parsed.data.reason },
    }).catch((error) =>
      captureError(error, { action: "withdrawal.audit", returnRequestId: returnRequest.id })
    );
  }

  const html = `<pre>${receipt.replace(/[&<>"\']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!)}</pre>`;
  const emailSent = await sendEmail({
    to: parsed.data.email,
    subject: `${copy.subject} — ${orderNumber}`,
    text: receipt,
    html,
  }).catch(() => false);
  return { error: null, success: true, receipt, emailSent };
}
