"use client";

import { useEffect, useRef, useState } from "react";
import { QuantityStepper } from "@/components/quantity-stepper";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { BuyNowButton } from "@/components/buy-now-button";
import { WishlistButton } from "@/components/wishlist-button";
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
// adds to the cart) so the count only has to live in one place, and the
// mobile sticky bar — a second Add to Cart that appears once the real one
// scrolls out of view. The sticky bar's mobile/desktop visibility is a CSS
// rule (.shop-sticky-cta in shop.css), not a Tailwind hidden/sm:* utility:
// this page's CSS can load after the shared Tailwind stylesheet in the
// cascade (see the gallery fix earlier), so a bare utility class isn't
// reliably guaranteed to win at every viewport width. The scroll-triggered
// on/off (this component's job) is layered on top via a CSS class React
// toggles, which the desktop media query overrides unconditionally either way.
export function ProductPurchasePanel({
  product,
  priceDisplay,
  dict,
  cartDict,
  showBuyNow,
  wishlist,
}: {
  product: CartProduct;
  priceDisplay: string;
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
  const inlineRef = useRef<HTMLDivElement>(null);
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    const el = inlineRef.current;
    if (!el) return;
    // -10% bottom margin so the sticky bar appears a little before the real
    // button is fully offscreen, not right at the exact pixel edge.
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      {
        rootMargin: "0px 0px -10% 0px",
      }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={inlineRef} className="mt-6 flex flex-wrap items-center gap-3">
        <QuantityStepper
          value={quantity}
          onChange={(next) => setQuantity(Math.max(1, next))}
          decreaseLabel={cartDict.decreaseQuantity}
          increaseLabel={cartDict.increaseQuantity}
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

      <div className={`shop-sticky-cta ${stickyVisible ? "shop-sticky-cta--visible" : ""}`}>
        <div className="shop-sticky-cta-inner">
          <span className="shop-sticky-cta-price">{priceDisplay}</span>
          <AddToCartButton
            product={product}
            dict={dict}
            quantity={quantity}
            className="shop-cta-teal"
          />
        </div>
      </div>
    </>
  );
}
