"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { formatMoney } from "@/lib/format";
import { applyTemplate } from "@/lib/i18n/format";
import { QuantityStepper } from "@/components/quantity-stepper";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function CartClient({
  locale,
  dict,
  freeShippingThreshold,
}: {
  locale: string;
  dict: Dictionary["cart"];
  freeShippingThreshold: number | null;
}) {
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  if (items.length === 0) {
    return (
      <div className="border-foreground/10 bg-surface flex flex-col items-center gap-4 rounded-lg border px-6 py-16 text-center">
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary animate-cart-bounce"
          aria-hidden="true"
        >
          <circle cx="9" cy="20" r="1" />
          <circle cx="18" cy="20" r="1" />
          <path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 8H6" />
        </svg>
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
        <div className="border-foreground/10 bg-surface rounded-lg border p-4">
          {estimatedSubtotal >= freeShippingThreshold ? (
            <p className="text-primary text-sm font-medium">{dict.freeShippingUnlocked}</p>
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
              <div className="bg-foreground/10 h-2 w-full overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (estimatedSubtotal / freeShippingThreshold) * 100)}%`,
                  }}
                />
              </div>
            </>
          )}
        </div>
      )}

      <ul className="border-foreground/10 bg-surface divide-foreground/10 flex flex-col divide-y overflow-hidden rounded-lg border">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-4 p-4">
            {item.imageUrl && (
              <Link
                href={`/products/${item.slug}`}
                className="bg-background relative h-20 w-20 shrink-0 overflow-hidden rounded-lg"
              >
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </Link>
            )}
            <div className="min-w-0 flex-1">
              <Link
                href={`/products/${item.slug}`}
                className="hover:text-primary line-clamp-1 font-medium transition-colors"
              >
                {item.name}
              </Link>
              <p className="text-foreground/70 mt-0.5 text-sm">
                {formatMoney(item.price, item.currency, locale)}
              </p>
              <button
                type="button"
                onClick={() => removeItem(item.productId)}
                className="text-foreground/50 hover:text-danger mt-1 text-xs transition-colors"
              >
                {dict.remove}
              </button>
            </div>
            <QuantityStepper
              value={item.quantity}
              onChange={(next) => setQuantity(item.productId, next)}
              decreaseLabel={dict.decreaseQuantity}
              increaseLabel={dict.increaseQuantity}
            />
            <span className="w-20 shrink-0 text-right text-sm font-medium">
              {formatMoney(item.price * item.quantity, item.currency, locale)}
            </span>
          </li>
        ))}
      </ul>

      <div className="border-foreground/10 bg-surface flex items-center justify-between rounded-lg border p-4">
        <span className="text-foreground/70 text-sm">{dict.estimatedSubtotal}</span>
        <span className="text-lg font-semibold">
          {formatMoney(estimatedSubtotal, items[0].currency, locale)}
        </span>
      </div>

      <Link href="/checkout" className="btn-primary text-center">
        {dict.checkout}
      </Link>
    </div>
  );
}
