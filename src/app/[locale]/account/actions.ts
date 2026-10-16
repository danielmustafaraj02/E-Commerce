"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { auth, signOut } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/register-user";
import { getFeedback } from "@/lib/i18n/feedback";

export async function resendVerificationEmail(_prevState: unknown) {
  const t = await getFeedback();
  const session = await auth();
  if (!session?.user?.id) return { error: t.notSignedIn, sent: false };

  const { success } = await rateLimit(`resend-verify:${session.user.id}`, 3, 60_000);
  if (!success) return { error: t.tooManyRequests, sent: false };

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: t.accountNotFound, sent: false };
  if (user.emailVerified) return { error: t.alreadyVerified, sent: false };

  await sendVerificationEmail(user.email);
  return { error: null, sent: true };
}

export async function deleteAccount(_prevState: unknown, formData: FormData) {
  const t = await getFeedback();
  const session = await auth();
  if (!session?.user) return { error: t.notSignedIn };

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: t.accountNotFound };
  if (!user.passwordHash) {
    return { error: t.oauthContactSupport };
  }

  const password = String(formData.get("password") ?? "");
  if (!(await bcrypt.compare(password, user.passwordHash))) {
    return { error: t.incorrectPassword };
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
