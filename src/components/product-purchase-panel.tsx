"use client";

import { useState } from "react";
import { QuantityStepper } from "@/components/quantity-stepper";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { BuyNowButton } from "@/components/buy-now-button";
import { WishlistButton } from "@/components/wishlist-button";
import { MAX_CART_QUANTITY } from "@/lib/cart-store";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type CartProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  outOfStock: boolean;
};

// Owns everything quantity-dependent (the stepper plus every button that
// adds to the cart) so the count only has to live in one place. The old
// mobile sticky add-to-cart bar was removed; the inline controls are the
// only path to the cart.
export function ProductPurchasePanel({
  product,
  dict,
  cartDict,
  showBuyNow,
  wishlist,
}: {
  product: CartProduct;
  dict: Dictionary["product"];
  cartDict: { decreaseQuantity: string; increaseQuantity: string };
  showBuyNow: boolean;
  wishlist: {
    productId: string;
    slug: string;
    name: string;
    price: number;
    currency: string;
    imageUrl: string | null;
    initialSaved: boolean;
    isSignedIn: boolean;
    addLabel: string;
    removeLabel: string;
  };
}) {
  const [quantity, setQuantity] = useState(1);

  return (
    <>
      <div className="shop-purchase-controls mt-6 flex flex-wrap items-center gap-3">
        <QuantityStepper
          value={quantity}
          onChange={(next) => setQuantity(Math.max(1, next))}
          max={MAX_CART_QUANTITY}
          decreaseLabel={cartDict.decreaseQuantity}
          increaseLabel={cartDict.increaseQuantity}
          className="shop-purchase-quantity"
        />
        <AddToCartButton
          product={product}
          dict={dict}
          quantity={quantity}
          className="shop-cta-teal"
        />
      </div>

      {showBuyNow && (
        <BuyNowButton product={product} label={dict.buyNow} quantity={quantity} className="mt-3" />
      )}

      <WishlistButton {...wishlist} />
    </>
  );
}
