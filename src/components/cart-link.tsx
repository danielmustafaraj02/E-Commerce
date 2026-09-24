"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";

export function CartLink({ label }: { label: string }) {
  const count = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const [bump, setBump] = useState(false);
  const prevCount = useRef(count);

  useEffect(() => {
    if (count > prevCount.current) {
      setBump(true);
      const timeout = setTimeout(() => setBump(false), 350);
      prevCount.current = count;
      return () => clearTimeout(timeout);
    }
    prevCount.current = count;
  }, [count]);

  return (
    <Link
      href="/cart"
      aria-label={label}
      title={label}
      className="group link-underline text-foreground/80 hover:text-primary flex items-center gap-1 max-sm:-m-1.5 max-sm:p-1.5"
    >
      <svg
        width="25"
        height="25"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform duration-200 ease-out group-hover:scale-110 group-hover:-rotate-6"
        aria-hidden="true"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.5 3h2l2.7 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21.5 8H6.2" />
      </svg>
      {count > 0 ? (
        <span data-bump={bump} className="inline-block">
          ({count})
        </span>
      ) : null}
    </Link>
  );
}
