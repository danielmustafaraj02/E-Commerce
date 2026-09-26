"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";

export function QuickAddButton({
  product,
  label,
  addedLabel,
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
  addedLabel?: string;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);
  const actionLabel = `${label}: ${product.name}`;

  return (
    <>
      <button
        type="button"
        aria-label={actionLabel}
        title={actionLabel}
        disabled={added}
        onClick={() => {
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
        className="bg-background/95 text-foreground absolute right-2 bottom-2 z-10 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full opacity-0 shadow-md transition-[opacity,transform] duration-200 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110 focus-visible:translate-y-0 focus-visible:opacity-100 active:scale-95 disabled:pointer-events-none motion-reduce:transition-none [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100"
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
            aria-hidden="true"
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
            aria-hidden="true"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.5 3h2l2.7 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21.5 8H6.2" />
            <path d="M13 8v5M10.5 10.5h5" />
          </svg>
        )}
      </button>
      <span role="status" className="sr-only">
        {added ? addedLabel : ""}
      </span>
    </>
  );
}
