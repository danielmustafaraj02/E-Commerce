"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { signIn } from "@/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

export async function login(_prevState: unknown, formData: FormData) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = await rateLimit(`login:${ip}`, 10, 60_000);
  if (!success) {
    return { error: "Too many attempts. Try again in a minute.", mfaRequired: false };
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const totpCode = String(formData.get("totpCode") ?? "").trim() || undefined;
  const callbackUrl = String(formData.get("callbackUrl") ?? "/account");

  // Only checked on the initial (non-MFA-code) submission — by the retry
  // step credentials are already known-good from the pre-check below, and
  // Turnstile tokens are single-use.
  if (!totpCode) {
    const captchaOk = await verifyTurnstile(
      formData.get("cf-turnstile-response") as string | null,
      ip
    );
    if (!captchaOk) {
      return { error: "Verification failed. Please try again.", mfaRequired: false };
    }
  }

  // Progressive disclosure only: reveals the authenticator-code field for
  // accounts that need it, without confirming/denying MFA status for a
  // wrong password (would otherwise leak which accounts have MFA enabled).
  // authorize() in auth.ts is the actual authority on whether the code is
  // required and valid.
  if (!totpCode) {
    const user = await db.user.findUnique({ where: { email } });
    if (
      user?.mfaEnabled &&
      user.passwordHash &&
      (await bcrypt.compare(password, user.passwordHash))
    ) {
      return { error: null, mfaRequired: true };
    }
  }

  try {
    await signIn("credentials", { email, password, totpCode, redirectTo: callbackUrl });
    return { error: null, mfaRequired: false };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: totpCode ? "Invalid email, password, or code" : "Invalid email or password",
        mfaRequired: Boolean(totpCode),
      };
    }
    throw error;
  }
}
