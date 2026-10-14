"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { writeAuditLog } from "@/lib/audit-log";
import { requestPasswordReset } from "@/lib/password-reset";

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

const inviteSchema = z.object({
  name: z.string().trim().min(1, "Add a name").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  role: z.enum(["staff", "admin"]),
});

// Creates a team account for someone who has not registered yet, so they do not
// have to sign up first. The account gets a random password nobody knows and an
// emailed set-password link (the normal reset flow), so the admin never sees or
// chooses a password. An existing account just gets the role, as in setUserRole.
// Admin-only for the same reason as role changes.
export type InviteState = { error: string | null; ok?: string };

export async function inviteTeamMember(
  _prevState: InviteState,
  formData: FormData
): Promise<InviteState> {
  const session = await requireAdmin();

  const parsed = inviteSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { name, email, role } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing?.role === "admin" && role !== "admin") {
    return { error: "That person is an admin already. Use the role form above to change it." };
  }

  const user = existing
    ? await db.user.update({ where: { id: existing.id }, data: { role } })
    : await db.user.create({
        data: {
          email,
          name,
          role,
          passwordHash: await bcrypt.hash(randomBytes(32).toString("base64url"), 12),
          emailVerified: new Date(),
        },
      });

  await writeAuditLog({
    userId: session!.user.id,
    action: existing ? "user.role_change" : "user.invite",
    entityType: "User",
    entityId: user.id,
    before: existing ? { role: existing.role } : undefined,
    after: { role: user.role },
  });

  // Best effort: the account exists either way, and "Forgot password" on the
  // login page sends the same link again.
  let emailed = true;
  try {
    await requestPasswordReset(email);
  } catch (error) {
    emailed = false;
    console.warn(
      "[team] Failed to send invite email:",
      error instanceof Error ? error.message : error
    );
  }

  return {
    error: null,
    ok: emailed
      ? `${email} added as ${role}. We emailed a link to set their password (valid for 1 hour).`
      : `${email} added as ${role}, but the email could not be sent. Ask them to use “Forgot password” on the login page.`,
  };
}
