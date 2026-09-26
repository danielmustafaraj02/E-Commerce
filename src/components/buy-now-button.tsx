"use client";

import { useState } from "react";
import { useLocalizedRouter } from "@/components/localized-link";
import { useCartStore } from "@/lib/cart-store";

// Adds the item to the cart and goes straight to checkout, for a shopper who
// just wants to pay — skips the extra trip through /cart. Works for guests
// too: /checkout supports guest checkout, so this must never be gated on
// being signed in (that would force account creation to buy fast).
export function BuyNowButton({
  product,
  label,
  quantity = 1,
  className = "",
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
  label: string;
  quantity?: number;
  className?: string;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const router = useLocalizedRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={product.outOfStock || pending}
      onClick={() => {
        setPending(true);
        addItem(
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            currency: product.currency,
            imageUrl: product.imageUrl,
          },
          quantity
        );
        router.push("/checkout");
      }}
      className={`btn-secondary transition-transform duration-150 will-change-transform active:scale-95 max-sm:w-full max-sm:py-3 ${className}`}
    >
      {label}
    </button>
  );
}
