"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";

// Adds the item to the cart and goes straight to checkout, for a shopper
// who's already signed in and just wants to pay — skips the extra trip
// through /cart. Signed-out shoppers still get the normal add-to-cart flow;
// checkout supports guest checkout too, but this shortcut is only offered
// once someone's actually signed in.
export function BuyNowButton({
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
    outOfStock: boolean;
  };
  label: string;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={product.outOfStock || pending}
      onClick={() => {
        setPending(true);
        addItem({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          currency: product.currency,
          imageUrl: product.imageUrl,
        });
        router.push("/checkout");
      }}
      className="btn-secondary ms-3 mt-8 transition-transform duration-150 will-change-transform active:scale-95 max-sm:ms-0 max-sm:mt-3 max-sm:w-full max-sm:py-3"
    >
      {label}
    </button>
  );
}
