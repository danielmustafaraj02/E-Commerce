"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";

const schema = z.object({
  status: z.enum(["requested", "approved", "rejected", "received", "refunded"]),
});

export async function updateReturnRequest(
  returnRequestId: string,
  _prevState: unknown,
  formData: FormData
) {
  const session = await requireStaff();

  const parsed = schema.safeParse({ status: formData.get("status") });
  if (!parsed.success) return { error: "Invalid input" };

  const before = await db.returnRequest.findUnique({ where: { id: returnRequestId } });
  if (!before) return { error: "Return request not found" };

  const updated = await db.returnRequest.update({
    where: { id: returnRequestId },
    data: { status: parsed.data.status },
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "return_request.update",
    entityType: "ReturnRequest",
    entityId: updated.id,
    before: { status: before.status },
    after: { status: updated.status },
  });

  redirect("/admin/returns");
}
