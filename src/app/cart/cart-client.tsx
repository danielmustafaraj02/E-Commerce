"use client";

import { CatalogImage } from "@/components/catalog-image";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { formatMoney } from "@/lib/format";
import { applyTemplate } from "@/lib/i18n/format";
import { QuantityStepper } from "@/components/quantity-stepper";
import { BeadMark } from "@/components/bead-mark";
import { ExpressCheckoutButton } from "@/components/express-checkout-button";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function CartClient({
  locale,
  uiLocale,
  dict,
  shippingBanner,
  freeShippingThreshold,
  stripePublishableKey,
}: {
  locale: string;
  uiLocale: string;
  dict: Dictionary["cart"];
  shippingBanner: string;
  freeShippingThreshold: number | null;
  stripePublishableKey: string | null;
}) {
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  if (items.length === 0) {
    return (
      <div className="shop-panel shop-empty">
        <BeadMark size={104} className="shop-settle" />
        <p className="text-foreground/70 text-sm">{dict.empty}</p>
        <Link href="/products" className="btn-primary text-sm">
          {dict.browse}
        </Link>
      </div>
    );
  }

  // Display estimate only — the server recomputes authoritative pricing,
  // stock, tax, and shipping from live product data at checkout.
  const estimatedSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="flex flex-col gap-6">
      {freeShippingThreshold !== null && (
        <div className="shop-panel shop-panel-pad">
          {estimatedSubtotal >= freeShippingThreshold ? (
            <p className="text-accent-deep flex items-center text-sm font-medium">
              <span className="shop-check shop-settle" aria-hidden="true">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              {dict.freeShippingUnlocked}
            </p>
          ) : (
            <>
              <p className="text-foreground/70 mb-2 text-sm">
                {applyTemplate(dict.freeShippingProgress, {
                  amount: formatMoney(
                    freeShippingThreshold - estimatedSubtotal,
                    items[0].currency,
                    locale
                  ),
                })}
              </p>
              <div className="shop-track">
                <div
                  className="shop-fill"
                  style={{
                    width: `${Math.min(100, (estimatedSubtotal / freeShippingThreshold) * 100)}%`,
                  }}
                />
              </div>
            </>
          )}
        </div>
      )}

      <ul className="shop-panel shop-list">
        {items.map((item) => (
          <li key={item.productId} className="shop-cart-line">
            {item.imageUrl ? (
              <Link href={`/products/${item.slug}`} className="shop-thumb shop-thumb--cart">
                <CatalogImage src={item.imageUrl} alt={item.name} fill sizes="64px" />
              </Link>
            ) : (
              <span className="shop-thumb shop-thumb--cart" aria-hidden="true" />
            )}
            <div className="min-w-0">
              <Link href={`/products/${item.slug}`} className="shop-line-name line-clamp-2">
                {item.name}
              </Link>
              <p className="text-foreground/70 mt-0.5 text-sm">
                {formatMoney(item.price, item.currency, locale)}
              </p>
              <button
                type="button"
                onClick={() => removeItem(item.productId)}
                className="text-foreground/60 hover:text-danger mt-1 text-xs underline-offset-2 transition-colors hover:underline"
              >
                {dict.remove}
              </button>
            </div>
            <div className="shop-cart-controls">
              <QuantityStepper
                value={item.quantity}
                onChange={(next) => setQuantity(item.productId, next)}
                decreaseLabel={dict.decreaseQuantity}
                increaseLabel={dict.increaseQuantity}
              />
              <span className="shop-cart-total">
                {formatMoney(item.price * item.quantity, item.currency, locale)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <div className="shop-panel shop-panel-pad flex items-center justify-between">
        <span className="text-foreground/70 text-sm">{dict.estimatedSubtotal}</span>
        <span className="shop-total">
          {formatMoney(estimatedSubtotal, items[0].currency, locale)}
        </span>
      </div>

      <p className="text-foreground/70 -mt-3 text-sm">{shippingBanner}</p>

      <Link href="/checkout" className="btn-primary text-center">
        {dict.checkout}
      </Link>

      <ExpressCheckoutButton
        publishableKey={stripePublishableKey}
        locale={uiLocale}
        dividerLabel={dict.expressCheckoutOr}
      />
    </div>
  );
}
