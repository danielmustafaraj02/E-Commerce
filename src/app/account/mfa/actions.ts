"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { verifyMfaToken } from "@/lib/mfa";

export async function confirmMfa(_prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in" };

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
