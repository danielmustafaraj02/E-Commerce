"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { verifyMfaToken } from "@/lib/mfa";
import { rateLimit } from "@/lib/rate-limit";
import { getFeedback } from "@/lib/i18n/feedback";

export async function confirmMfa(_prevState: unknown, formData: FormData) {
  const t = await getFeedback();
  const session = await auth();
  if (!session?.user) return { error: t.notSignedIn };

  // A 6-digit TOTP code is only ~1,000,000 possibilities and, unlike a
  // password, isn't hashed with a slow algorithm — without this, a script
  // could brute-force a code within the ~30s window it's valid for.
  const { success: withinLimit } = await rateLimit(`mfa-confirm:${session.user.id}`, 5, 60_000);
  if (!withinLimit) return { error: t.tooManyAttempts };

  const code = String(formData.get("code") ?? "").trim();
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.mfaSecret) return { error: t.mfaSetupNotFound };

  if (!(await verifyMfaToken(user.mfaSecret, code))) {
    return { error: t.invalidMfaCode };
  }

  await db.user.update({ where: { id: user.id }, data: { mfaEnabled: true } });
  redirect("/account/mfa");
}

export async function disableMfa(_prevState: unknown, formData: FormData) {
  const t = await getFeedback();
  const session = await auth();
  if (!session?.user) return { error: t.notSignedIn };

  const { success: withinLimit } = await rateLimit(`mfa-disable:${session.user.id}`, 5, 60_000);
  if (!withinLimit) return { error: t.tooManyAttempts };

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: t.accountNotFound };
  if (!user.passwordHash) return { error: t.oauthNoMfaPassword };

  const password = String(formData.get("password") ?? "");
  if (!(await bcrypt.compare(password, user.passwordHash))) {
    return { error: t.incorrectPassword };
  }

  await db.user.update({ where: { id: user.id }, data: { mfaEnabled: false, mfaSecret: null } });
  redirect("/account/mfa");
}
