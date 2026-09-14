"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { formatMoney } from "@/lib/format";
import { QuantityStepper } from "@/components/quantity-stepper";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function CartClient({ locale, dict }: { locale: string; dict: Dictionary["cart"] }) {
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  if (items.length === 0) {
    return (
      <div className="border-foreground/10 bg-surface flex flex-col items-center gap-3 rounded-lg border px-6 py-16 text-center">
        <p className="text-foreground/70 text-sm">{dict.empty}</p>
        <Link
          href="/products"
          className="bg-primary rounded px-5 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:opacity-90"
        >
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

      <Link
        href="/checkout"
        className="bg-primary rounded px-4 py-3 text-center font-medium text-white transition-all hover:-translate-y-0.5 hover:opacity-90"
      >
        {dict.checkout}
      </Link>
    </div>
  );
}
