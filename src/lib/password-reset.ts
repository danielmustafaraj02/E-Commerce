import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { sendPasswordResetEmailMessage, sendPasswordChangedEmail } from "@/lib/email";

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

// Same 8–72 bounds as registration (72 is bcrypt's input limit).
export const newPasswordSchema = z.string().min(8).max(72);

// Reset tokens share the VerificationToken table with email-verification
// tokens; the identifier prefix keeps the two from ever being interchangeable.
const IDENTIFIER_PREFIX = "password-reset:";

// Only a SHA-256 of the token is stored, so a leaked/dumped table can't be
// replayed as working reset links. The raw token exists only in the email.
export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

// Emails a reset link if — and only if — the address belongs to an account
// that has a password. Callers must not reveal which case happened (that would
// let anyone probe which emails are registered), so this returns nothing.
export async function requestPasswordReset(email: string) {
  const user = await db.user.findUnique({
    where: { email },
    select: { email: true, passwordHash: true },
  });
  // Unknown address, or an OAuth-only account with no password to reset.
  if (!user?.passwordHash) return;

  const identifier = IDENTIFIER_PREFIX + user.email;
  // One live link per account: a newer request kills the older emailed link.
  await db.verificationToken.deleteMany({ where: { identifier } });

  const token = randomBytes(32).toString("base64url");
  await db.verificationToken.create({
    data: {
      identifier,
      token: hashResetToken(token),
      expires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  const settings = await getStoreSettings();
  const base = settings.siteUrl || process.env.NEXTAUTH_URL || "http://localhost:3000";
  await sendPasswordResetEmailMessage({
    to: user.email,
    resetUrl: `${base}/reset-password?token=${token}`,
    expiresInMinutes: RESET_TOKEN_TTL_MS / 60_000,
  });
}

// Read-only check so the page can say "this link is dead" before the user
// types a new password. Does not consume the token.
export async function isResetTokenValid(token: string) {
  const record = await db.verificationToken.findUnique({
    where: { token: hashResetToken(token) },
  });
  return Boolean(
    record && record.identifier.startsWith(IDENTIFIER_PREFIX) && record.expires > new Date()
  );
}

export type ResetResult = "ok" | "invalid";

export async function resetPassword(token: string, newPassword: string): Promise<ResetResult> {
  const hashed = hashResetToken(token);
  // Hashed before the transaction: bcrypt is deliberately slow and shouldn't
  // hold a DB transaction open.
  const passwordHash = await bcrypt.hash(newPassword, 12);

  const email = await db.$transaction(async (tx) => {
    const record = await tx.verificationToken.findUnique({ where: { token: hashed } });
    if (!record || !record.identifier.startsWith(IDENTIFIER_PREFIX)) return null;

    // Claim the token atomically: of two simultaneous submissions only one
    // deletes a row, so a link can never be used twice.
    const claimed = await tx.verificationToken.deleteMany({ where: { token: hashed } });
    if (claimed.count !== 1 || record.expires < new Date()) return null;

    const email = record.identifier.slice(IDENTIFIER_PREFIX.length);
    const updated = await tx.user.updateMany({
      where: { email },
      data: {
        passwordHash,
        // Ends every session signed in before now (see session-refresh.ts) —
        // the point of a reset is often "someone else may have my account".
        passwordChangedAt: new Date(),
        // Recovering the account also clears a brute-force lockout.
        failedLoginCount: 0,
        lockedUntil: null,
      },
    });
    if (updated.count !== 1) return null;

    await tx.verificationToken.deleteMany({ where: { identifier: record.identifier } });
    return email;
  });
  if (!email) return "invalid";

  // Best effort — the password is already changed. A "was this you?" notice
  // is how the real owner finds out if someone else triggered it.
  try {
    await sendPasswordChangedEmail(email);
  } catch (error) {
    console.warn(`[password-reset] Failed to send password-changed notice to ${email}:`, error);
  }
  return "ok";
}
