"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";

const ROLES = ["customer", "staff", "admin"] as const;

const promoteSchema = z.object({
  email: z.string().email(),
  role: z.enum(ROLES),
});

// Role changes are admin-only (requireStaff isn't enough here — a staff
// account handing out admin/staff access to anyone, including itself, would
// defeat the point of having a least-privilege role at all — see build spec
// §11.2). Every change is audit-logged, and the last admin account can't be
// demoted, so there's never a moment where no one can manage the store.
export async function setUserRole(_prevState: unknown, formData: FormData) {
  const session = await requireAdmin();

  const parsed = promoteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const target = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!target) return { error: "No account found with that email" };

  if (target.role === "admin" && parsed.data.role !== "admin") {
    const adminCount = await db.user.count({ where: { role: "admin" } });
    if (adminCount <= 1) return { error: "Can't remove the last admin account" };
  }

  const updated = await db.user.update({
    where: { id: target.id },
    data: { role: parsed.data.role },
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "user.role_change",
    entityType: "User",
    entityId: target.id,
    before: { role: target.role },
    after: { role: updated.role },
  });

  redirect("/admin/team");
}
