"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function AddToCartButton({
  product,
  dict,
}: {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    currency: string;
    imageUrl: string | null;
    outOfStock: boolean;
  };
  dict: Dictionary["product"];
}) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      disabled={product.outOfStock}
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
        setTimeout(() => setAdded(false), 1500);
      }}
      className="btn-primary mt-8 transition-transform duration-150 will-change-transform active:scale-95 max-sm:w-full max-sm:py-3"
    >
      <span key={added ? "added" : "idle"} className="animate-pop-in inline-block">
        {product.outOfStock ? dict.outOfStock : added ? `✓ ${dict.added}` : dict.addToCart}
      </span>
    </button>
  );
}
