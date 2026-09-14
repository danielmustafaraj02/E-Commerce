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
    <Link href="/cart" className="link-underline text-foreground/80 hover:text-primary">
      {label}
      {count > 0 ? (
        <span data-bump={bump} className="ml-1 inline-block">
          ({count})
        </span>
      ) : null}
    </Link>
  );
}
