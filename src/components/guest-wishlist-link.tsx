"use client";

import Link from "next/link";
import { useWishlistStore } from "@/lib/wishlist-store";

// Signed-out counterpart to the account wishlist link in header.tsx — reads
// the device-local guest store (src/lib/wishlist-store.ts) instead of a DB
// count, and points at the public /wishlist page instead of /account/wishlist.
export function GuestWishlistLink({ label }: { label: string }) {
  const count = useWishlistStore((state) => state.items.length);

  return (
    <Link
      href="/wishlist"
      aria-label={label}
      title={label}
      className="group link-underline text-foreground/80 hover:text-danger flex items-center gap-1 transition-colors"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform duration-200 ease-out group-hover:-rotate-12 group-hover:scale-125"
        aria-hidden="true"
      >
        <path d="M20.8 4.6c-1.9-1.6-4.6-1.4-6.3.4L12 7.5l-2.5-2.5c-1.7-1.8-4.4-2-6.3-.4-2.1 1.8-2.2 5-.3 6.9L12 21l9.1-9.5c1.9-1.9 1.8-5.1-.3-6.9Z" />
      </svg>
      {count > 0 ? <span>({count})</span> : null}
    </Link>
  );
}
