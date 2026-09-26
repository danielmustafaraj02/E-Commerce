"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { getFeedback } from "@/lib/i18n/feedback";

export async function toggleWishlist(productId: string, slug: string) {
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
    revalidatePath(`/products/${slug}`);
    revalidatePath("/account/wishlist");
    return { error: null, saved: false };
  }

  await db.wishlistItem.create({ data: { productId, userId } });
  revalidatePath(`/products/${slug}`);
  revalidatePath("/account/wishlist");
  return { error: null, saved: true };
}
