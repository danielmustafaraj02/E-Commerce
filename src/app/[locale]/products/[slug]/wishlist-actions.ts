"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { getFeedback } from "@/lib/i18n/feedback";

// `_slug`: kept in the signature for callers; nothing needs it any more.
export async function toggleWishlist(productId: string, _slug: string) {
  const t = await getFeedback();
  const session = await auth();
  if (!session?.user?.id) return { error: t.signInToWishlist, saved: false };

  const { success: withinLimit } = await rateLimit(`wishlist:${session.user.id}`, 30, 60_000);
  if (!withinLimit) return { error: t.tooManyRequests, saved: false };

  const userId = session.user.id;

  // Gated on a confirmed email, not just "signed in" — an unconfirmed
  // account costs nothing for a bot to create, so this is the actual
  // anti-abuse boundary for an otherwise-free, DB-writing action.
  const account = await db.user.findUnique({ where: { id: userId }, select: { emailVerified: true } });
  if (!account?.emailVerified) {
    return { error: t.confirmEmailToWishlist, saved: false };
  }
  const existing = await db.wishlistItem.findUnique({
    where: { productId_userId: { productId, userId } },
  });

  if (existing) {
    await db.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/[locale]/account/wishlist", "page");
    return { error: null, saved: false };
  }

  // The product page is the same for everyone (cached); only the account's
  // wishlist page shows this visitor's list.
  await db.wishlistItem.create({ data: { productId, userId } });
  revalidatePath("/[locale]/account/wishlist", "page");
  return { error: null, saved: true };
}
