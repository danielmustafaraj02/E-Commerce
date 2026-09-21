"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { cookies, headers } from "next/headers";
import { signIn } from "@/auth";
import { db } from "@/lib/db";
import {
  LOGIN_PROOF_COOKIE,
  LOGIN_PROOF_TTL_SECONDS,
  createLoginProof,
  verifyLoginProof,
} from "@/lib/login-proof";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { getFeedback } from "@/lib/i18n/feedback";

export async function login(_prevState: unknown, formData: FormData) {
  const t = await getFeedback();
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = await rateLimit(`login:${ip}`, 10, 60_000);
  if (!success) {
    return { error: t.tooManyAttempts, mfaRequired: false };
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const totpCode = String(formData.get("totpCode") ?? "").trim() || undefined;
  const callbackUrl = String(formData.get("callbackUrl") ?? "/account");

  // Turnstile tokens are single-use, so the second (authenticator-code) step
  // can't present a fresh one. It may only skip the captcha by showing the
  // signed proof step 1 issued for this same email — never merely because a
  // `totpCode` field is present, which any client can send.
  const cookieStore = await cookies();
  const captchaWaived =
    Boolean(totpCode) && verifyLoginProof(email, cookieStore.get(LOGIN_PROOF_COOKIE)?.value);
  if (!captchaWaived) {
    const captchaOk = await verifyTurnstile(
      formData.get("cf-turnstile-response") as string | null,
      ip
    );
    if (!captchaOk) {
      return { error: t.verificationFailed, mfaRequired: false };
    }
  }

  // Progressive disclosure only: reveals the authenticator-code field for
  // accounts that need it, without confirming/denying MFA status for a
  // wrong password (would otherwise leak which accounts have MFA enabled).
  // authorize() in auth.ts is the actual authority on whether the code is
  // required and valid.
  //
  // A locked account is skipped: this check does its own bcrypt compare that
  // authorize() never sees, so honouring the lock here is what stops it from
  // being an unlimited "is this password right?" oracle once the lock is on.
  // A wrong password falls through to signIn(), where authorize() counts it.
  if (!totpCode) {
    const user = await db.user.findUnique({ where: { email } });
    const locked = Boolean(user?.lockedUntil && user.lockedUntil > new Date());
    if (
      user?.mfaEnabled &&
      user.passwordHash &&
      !locked &&
      (await bcrypt.compare(password, user.passwordHash))
    ) {
      cookieStore.set(LOGIN_PROOF_COOKIE, createLoginProof(email), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: LOGIN_PROOF_TTL_SECONDS,
      });
      return { error: null, mfaRequired: true };
    }
  }

  try {
    await signIn("credentials", { email, password, totpCode, redirectTo: callbackUrl });
    return { error: null, mfaRequired: false };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: totpCode ? t.invalidCredentialsOrCode : t.invalidCredentials,
        mfaRequired: Boolean(totpCode),
      };
    }
    throw error;
  }
}
