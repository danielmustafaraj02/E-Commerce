"use client";

import { useState, useTransition } from "react";
import { toggleWishlist } from "@/app/products/[slug]/wishlist-actions";

export function WishlistButton({
  productId,
  slug,
  initialSaved,
  isSignedIn,
  addLabel,
  removeLabel,
  signInLabel,
}: {
  productId: string;
  slug: string;
  initialSaved: boolean;
  isSignedIn: boolean;
  addLabel: string;
  removeLabel: string;
  signInLabel: string;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isSignedIn) {
    return <p className="text-foreground/60 mt-3 text-sm">{signInLabel}</p>;
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        disabled={isPending}
        aria-pressed={saved}
        onClick={() => {
          // Optimistic — the server action is the source of truth and will
          // reconcile on the next revalidated render if this ever mismatches.
          setSaved((prev) => !prev);
          setError(null);
          startTransition(async () => {
            const result = await toggleWishlist(productId, slug);
            if (result.error) {
              setSaved((prev) => !prev);
              setError(result.error);
            }
          });
        }}
        className="text-foreground/70 hover:text-primary flex items-center gap-1.5 text-sm transition-colors disabled:opacity-50"
      >
        <span aria-hidden="true">{saved ? "♥" : "♡"}</span>
        {saved ? removeLabel : addLabel}
      </button>
      {error && <p className="text-danger mt-1 text-xs">{error}</p>}
    </div>
  );
}
