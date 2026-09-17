import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendVerificationEmailMessage } from "@/lib/email";
import { getStoreSettings } from "@/lib/store-settings";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  name: z.string().min(1).max(100).optional(),
});

export class RegistrationError extends Error {}

export async function registerUser(input: z.infer<typeof registerSchema>) {
  const existing = await db.user.findUnique({ where: { email: input.email } });
  if (existing) {
    // Generic message on purpose — don't confirm which emails are registered.
    throw new RegistrationError("Unable to register with these details");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await db.user.create({
    data: { email: input.email, passwordHash, name: input.name, role: "customer" },
  });

  // Best-effort — a transient email-provider hiccup shouldn't fail account
  // creation itself (same graceful-degradation stance as sendEmail already
  // takes when Resend isn't configured at all).
  try {
    await sendVerificationEmail(user.email);
  } catch (error) {
    console.warn(`[register] Failed to send verification email to ${user.email}:`, error);
  }

  return user;
}

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

// Unauthenticated by design — an account made mostly of throwaway/victim
// emails never confirming is exactly the bot-signup pattern this exists to
// surface, not something to gate behind a login the bot already has.
export async function sendVerificationEmail(email: string) {
  // A fresh token replaces any still-outstanding one for the same address so
  // an old, previously-emailed link can't be used after a resend.
  await db.verificationToken.deleteMany({ where: { identifier: email } });

  const token = crypto.randomUUID() + crypto.randomUUID();
  await db.verificationToken.create({
    data: { identifier: email, token, expires: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS) },
  });

  const settings = await getStoreSettings();
  const base = settings.siteUrl || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verifyUrl = `${base}/api/auth/verify-email?token=${token}`;
  const expiresInHours = VERIFICATION_TOKEN_TTL_MS / (60 * 60 * 1000);

  await sendVerificationEmailMessage({ to: email, verifyUrl, expiresInHours });
}
