"use client";

import { Link } from "@/components/localized-link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { splitLocalePrefix } from "@/lib/i18n/locale-constants";

// A persistent nudge toward checkout once there's something in the cart —
// the same pattern most stores use so a shopper never has to hunt for the
// cart icon in the header after adding something. Hidden on /cart and
// /checkout themselves, since the shopper is already there, and on product
// pages, which have their own bottom-fixed sticky Add to Cart bar
// (components/product-purchase-panel.tsx) — showing both would be two
// competing fixed elements fighting for the same corner of the screen.
export function FloatingCheckoutButton({ label }: { label: string }) {
  const count = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const { rest: path } = splitLocalePrefix(usePathname());

  if (count === 0) return null;
  if (path === "/cart" || path === "/checkout") return null;
  if (path.startsWith("/products/")) return null;

  return (
    <Link
      href="/checkout"
      className="btn-primary animate-pop-in fixed end-5 z-40 flex items-center gap-2 rounded-full px-5 py-3 text-sm shadow-lg transition-transform duration-150 will-change-transform hover:scale-105 active:scale-95"
      style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}
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
