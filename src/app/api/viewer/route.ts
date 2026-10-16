import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { isLocalAdminAccess } from "@/lib/local-features";
import { hasPurchased } from "@/app/[locale]/products/[slug]/review-actions";

// Who is looking at a page, for the parts of cached pages that depend on it:
// the header (account link, wishlist count, Admin link) and, with
// ?productId=, a product page's wishlist heart and review form. The pages
// themselves are the same for everyone and served from cache; only this small
// answer is per visitor, so it is never cached anywhere.
export type Viewer = {
  signedIn: boolean;
  isStaff: boolean;
  wishlistCount: number;
  product?: {
    saved: boolean;
    canReview: boolean;
    review: { rating: number; comment: string | null } | null;
  };
};

const PRIVATE = { "Cache-Control": "private, no-store" };

export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  const role = session?.user?.role;
  const isStaff =
    isLocalAdminAccess(request.headers.get("host")) || role === "admin" || role === "staff";
  if (!userId) {
    return NextResponse.json<Viewer>({ signedIn: false, isStaff, wishlistCount: 0 }, { headers: PRIVATE });
  }

  const productId = request.nextUrl.searchParams.get("productId");
  const [wishlistCount, product] = await Promise.all([
    db.wishlistItem.count({ where: { userId } }),
    productId ? productViewer(productId, userId) : undefined,
  ]);
  return NextResponse.json<Viewer>(
    { signedIn: true, isStaff, wishlistCount, product },
    { headers: PRIVATE }
  );
}

async function productViewer(productId: string, userId: string): Promise<Viewer["product"]> {
  const key = { productId_userId: { productId, userId } };
  const [saved, review, purchased] = await Promise.all([
    db.wishlistItem.findUnique({ where: key, select: { id: true } }),
    db.review.findUnique({ where: key, select: { rating: true, comment: true } }),
    hasPurchased(productId, userId),
  ]);
  return { saved: Boolean(saved), canReview: purchased || Boolean(review), review };
}
