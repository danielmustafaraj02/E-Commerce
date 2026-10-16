"use client";

import { Link } from "@/components/localized-link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { splitLocalePrefix } from "@/lib/i18n/locale-constants";

// A persistent nudge toward checkout once there's something in the cart —
// the same pattern most stores use so a shopper never has to hunt for the
// cart icon in the header after adding something. Hidden on cart and checkout,
// product pages with their own sticky purchase bar, and account access forms
// where a checkout prompt would distract from the task.
export function FloatingCheckoutButton({ label }: { label: string }) {
  const count = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const { rest: path } = splitLocalePrefix(usePathname());
  if (count === 0) return null;
  if (path === "/cart" || path === "/checkout") return null;
  if (path.startsWith("/products/")) return null;
  if (["/login", "/register", "/forgot-password", "/reset-password"].includes(path)) {
    return null;
  }

  return <FloatingCheckoutLink key={path} label={label} count={count} />;
}

function FloatingCheckoutLink({ label, count }: { label: string; count: number }) {
  const [scrollState, setScrollState] = useState<"entering" | "visible" | "hidden">("entering");
  const previousScrollY = useRef(0);

  useEffect(() => {
    previousScrollY.current = window.scrollY;
    let direction: "visible" | "hidden" | null = null;
    const enterFrame = window.requestAnimationFrame(() => {
      setScrollState(direction ?? "visible");
    });

    const onScroll = () => {
      const currentY = Math.max(0, window.scrollY);
      const delta = currentY - previousScrollY.current;

      if (currentY < 24) {
        direction = "visible";
        setScrollState("visible");
        previousScrollY.current = currentY;
        return;
      }

      // Ignore tiny touchpad and browser-chrome movements so the button does
      // not flicker when the shopper pauses or scrolls on a phone.
      if (Math.abs(delta) < 8) return;

      direction = delta > 0 ? "visible" : "hidden";
      setScrollState(direction);
      previousScrollY.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(enterFrame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <Link
      href="/checkout"
      className="btn-primary floating-checkout-button fixed end-5 z-40 flex items-center gap-2 rounded-(--radius-button) px-5 py-3 text-sm shadow-lg"
      data-scroll-state={scrollState}
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
