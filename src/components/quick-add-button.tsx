"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";

// Sits on top of the product card's image, inside the same <Link>, so it
// needs to stop the click from also triggering navigation to the product
// page — the whole point is *not* leaving the grid to add one to the cart.
export function QuickAddButton({
  product,
  label,
}: {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    currency: string;
    imageUrl: string | null;
  };
  label: string;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          currency: product.currency,
          imageUrl: product.imageUrl,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
      className="bg-background/95 text-foreground absolute right-2 bottom-2 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full opacity-0 shadow-md transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
    >
      {added ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-pop-in text-success"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.5 3h2l2.7 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21.5 8H6.2" />
          <path d="M13 8v5M10.5 10.5h5" />
        </svg>
      )}
    </button>
  );
}
