"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { verifyMfaToken } from "@/lib/mfa";
import { rateLimit } from "@/lib/rate-limit";

export async function confirmMfa(_prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in" };

  // A 6-digit TOTP code is only ~1,000,000 possibilities and, unlike a
  // password, isn't hashed with a slow algorithm — without this, a script
  // could brute-force a code within the ~30s window it's valid for.
  const { success: withinLimit } = await rateLimit(`mfa-confirm:${session.user.id}`, 5, 60_000);
  if (!withinLimit) return { error: "Too many attempts — wait a minute and try again" };

  const code = String(formData.get("code") ?? "").trim();
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.mfaSecret) return { error: "No pending MFA setup found — reload the page" };

  if (!(await verifyMfaToken(user.mfaSecret, code))) {
    return { error: "Invalid code" };
  }

  await db.user.update({ where: { id: user.id }, data: { mfaEnabled: true } });
  redirect("/account/mfa");
}

export async function disableMfa(_prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in" };

  const { success: withinLimit } = await rateLimit(`mfa-disable:${session.user.id}`, 5, 60_000);
  if (!withinLimit) return { error: "Too many attempts — wait a minute and try again" };

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "Account not found" };
  if (!user.passwordHash) return { error: "OAuth accounts must contact support" };

  const password = String(formData.get("password") ?? "");
  if (!(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Incorrect password" };
  }

  await db.user.update({ where: { id: user.id }, data: { mfaEnabled: false, mfaSecret: null } });
  redirect("/account/mfa");
}
