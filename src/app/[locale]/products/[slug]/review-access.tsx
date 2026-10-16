"use client";

import { Link } from "@/components/localized-link";
import { useViewer } from "@/components/viewer";
import { LOCAL_ACCOUNTS_ENABLED } from "@/lib/local-features";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { ReviewForm } from "./review-form";

// Under the reviews: sign in to review, the review form (for a verified buyer,
// or to edit one's own review), or why one can't. The product page is cached
// and the same for everyone, so which applies comes from /api/viewer.
export function ReviewAccess({
  productId,
  slug,
  dict,
}: {
  productId: string;
  slug: string;
  dict: Dictionary["product"];
}) {
  const viewer = useViewer(productId);
  if (!viewer?.signedIn) {
    return LOCAL_ACCOUNTS_ENABLED ? (
      <p className="text-foreground/70 mt-4 text-sm">
        <Link href="/login" className="text-primary hover:underline">
          {dict.signInToReview}
        </Link>
      </p>
    ) : null;
  }
  if (viewer.product?.canReview) {
    return (
      <ReviewForm productId={productId} slug={slug} existing={viewer.product.review} dict={dict} />
    );
  }
  return <p className="text-foreground/70 mt-4 text-sm">{dict.verifiedPurchaseOnly}</p>;
}
