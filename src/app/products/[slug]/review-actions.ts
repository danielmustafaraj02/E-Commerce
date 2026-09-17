"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  productId: z.string().min(1),
  slug: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

// Verified-purchase-gated: the authoritative check is here (server-side),
// not just in what the product page chooses to render — a request forged
// straight at this action still has to prove the account actually bought
// the item. The schema's @@unique([productId, userId]) is what stops a
// second review from the same account (upserted below so a customer can
// revise their own review instead of getting a confusing error).
const VERIFIED_PURCHASE_STATUSES = ["paid", "processing", "shipped", "delivered"];

export async function hasPurchased(productId: string, userId: string) {
  const order = await db.orderItem.findFirst({
    where: {
      productId,
      order: { userId, status: { in: VERIFIED_PURCHASE_STATUSES } },
    },
    select: { id: true },
  });
  return Boolean(order);
}

export async function submitReview(_prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in to leave a review", success: false };

  const { success: withinLimit } = await rateLimit(`review:${session.user.id}`, 10, 60_000);
  if (!withinLimit) return { error: "Too many requests. Try again shortly.", success: false };

  const account = await db.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true },
  });
  if (!account?.emailVerified) {
    return { error: "Confirm your email address to leave a review", success: false };
  }

  const parsed = schema.safeParse({
    productId: formData.get("productId"),
    slug: formData.get("slug"),
    rating: formData.get("rating"),
    comment: formData.get("comment") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid review", success: false };
  }

  const product = await db.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product) return { error: "Product not found", success: false };

  if (!(await hasPurchased(parsed.data.productId, session.user.id))) {
    return {
      error: "Only customers who've purchased this product can leave a review",
      success: false,
    };
  }

  await db.review.upsert({
    where: {
      productId_userId: { productId: parsed.data.productId, userId: session.user.id },
    },
    update: { rating: parsed.data.rating, comment: parsed.data.comment ?? null },
    create: {
      productId: parsed.data.productId,
      userId: session.user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment ?? null,
    },
  });

  revalidatePath(`/products/${parsed.data.slug}`);
  return { error: null, success: true };
}
