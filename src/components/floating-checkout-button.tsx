"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";

// A persistent nudge toward checkout once there's something in the cart —
// the same pattern most stores use so a shopper never has to hunt for the
// cart icon in the header after adding something. Hidden on /cart and
// /checkout themselves, since the shopper is already there.
export function FloatingCheckoutButton({ label }: { label: string }) {
  const count = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const pathname = usePathname();

  if (count === 0) return null;
  if (pathname === "/cart" || pathname === "/checkout") return null;

  return (
    <Link
      href="/checkout"
      className="btn-primary animate-pop-in fixed end-5 bottom-5 z-40 flex items-center gap-2 rounded-full px-5 py-3 text-sm shadow-lg transition-transform duration-150 will-change-transform hover:scale-105 active:scale-95"
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
        aria-hidden="true"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.5 3h2l2.7 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21.5 8H6.2" />
      </svg>
      {label} ({count})
    </Link>
  );
}
