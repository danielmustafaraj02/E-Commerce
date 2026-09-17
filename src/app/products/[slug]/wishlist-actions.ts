"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function toggleWishlist(productId: string, slug: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in to save items to your wishlist", saved: false };

  const { success: withinLimit } = await rateLimit(`wishlist:${session.user.id}`, 30, 60_000);
  if (!withinLimit) return { error: "Too many requests. Try again shortly.", saved: false };

  const userId = session.user.id;
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
