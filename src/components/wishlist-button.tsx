"use client";

import { useState, useTransition } from "react";
import { toggleWishlist } from "@/app/products/[slug]/wishlist-actions";
import { useWishlistStore } from "@/lib/wishlist-store";
import { ConfettiBurst } from "@/components/confetti-burst";

const CONFETTI_DURATION_MS = 850;

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={
        filled
          ? "fill-danger stroke-danger transition-all duration-150"
          : "fill-none stroke-current transition-all duration-150"
      }
      aria-hidden="true"
    >
      <path d="M20.8 4.6c-1.9-1.6-4.6-1.4-6.3.4L12 7.5l-2.5-2.5c-1.7-1.8-4.4-2-6.3-.4-2.1 1.8-2.2 5-.3 6.9L12 21l9.1-9.5c1.9-1.9 1.8-5.1-.3-6.9Z" />
    </svg>
  );
}

// Sits on its own line below AddToCartButton as a real secondary button
// (not a quiet text link) — the outer div is block-level so it always
// starts a new line regardless of the (inline) button before it, while the
// inner inline-block wrapper sizes ConfettiBurst's positioning to the
// button itself rather than the full-width row.
export function WishlistButton({
  productId,
  slug,
  name,
  price,
  currency,
  imageUrl,
  initialSaved,
  isSignedIn,
  addLabel,
  removeLabel,
}: {
  productId: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  initialSaved: boolean;
  isSignedIn: boolean;
  addLabel: string;
  removeLabel: string;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [celebrate, setCelebrate] = useState(false);

  // Signed out: no account to attach a WishlistItem row to, so this saves to
  // a device-local store instead (src/lib/wishlist-store.ts) rather than
  // blocking the action behind a sign-in wall.
  const guestSaved = useWishlistStore((state) => state.has(productId));
  const toggleGuest = useWishlistStore((state) => state.toggle);

  const fireConfetti = () => {
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), CONFETTI_DURATION_MS);
  };

  const buttonClass = (isSaved: boolean) =>
    `border-foreground/15 hover:border-danger/50 hover:bg-danger/5 inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
      isSaved ? "text-danger border-danger/30 bg-danger/5" : "text-foreground/80"
    }`;

  if (!isSignedIn) {
    return (
      <div className="mt-3">
        <div className="relative inline-block">
          <button
            type="button"
            aria-pressed={guestSaved}
            onClick={() => {
              if (!guestSaved) fireConfetti();
              toggleGuest({ productId, slug, name, price, currency, imageUrl });
            }}
            className={buttonClass(guestSaved)}
          >
            <HeartIcon filled={guestSaved} />
            {guestSaved ? removeLabel : addLabel}
          </button>
          {celebrate && <ConfettiBurst />}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="relative inline-block">
        <button
          type="button"
          disabled={isPending}
          aria-pressed={saved}
          onClick={() => {
            // Optimistic — the server action is the source of truth and will
            // reconcile on the next revalidated render if this ever mismatches.
            if (!saved) fireConfetti();
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
          className={buttonClass(saved)}
        >
          <HeartIcon filled={saved} />
          {saved ? removeLabel : addLabel}
        </button>
        {celebrate && <ConfettiBurst />}
      </div>
      {error && <p className="text-danger mt-1 text-xs">{error}</p>}
    </div>
  );
}
