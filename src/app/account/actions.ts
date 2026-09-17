"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { auth, signOut } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/register-user";

export async function resendVerificationEmail(_prevState: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in", sent: false };

  const { success } = await rateLimit(`resend-verify:${session.user.id}`, 3, 60_000);
  if (!success) return { error: "Too many requests. Try again shortly.", sent: false };

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "Account not found", sent: false };
  if (user.emailVerified) return { error: "Already verified", sent: false };

  await sendVerificationEmail(user.email);
  return { error: null, sent: true };
}

export async function deleteAccount(_prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in" };

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "Account not found" };
  if (!user.passwordHash) {
    return { error: "OAuth accounts must contact support to delete their account" };
  }

  const password = String(formData.get("password") ?? "");
  if (!(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Incorrect password" };
  }

  // "Right to be forgotten": scrub personal data but keep Orders/Payments —
  // those are retained for legal/tax record-keeping, now pointing at an
  // anonymized account instead of being deleted outright.
  await db.$transaction(async (tx) => {
    await tx.review.deleteMany({ where: { userId: user.id } });
    await tx.address.deleteMany({ where: { userId: user.id, orders: { none: {} } } });
    await tx.session.deleteMany({ where: { userId: user.id } });
    await tx.account.deleteMany({ where: { userId: user.id } });
    await tx.user.update({
      where: { id: user.id },
      data: {
        email: `deleted-${user.id}@anonymized.invalid`,
        name: null,
        image: null,
        passwordHash: null,
        mfaSecret: null,
        mfaEnabled: false,
      },
    });
  });

  await signOut({ redirectTo: "/" });
}
