"use client";

import Link from "next/link";
import { CatalogImage } from "@/components/catalog-image";
import { useWishlistStore } from "@/lib/wishlist-store";
import { QuickAddButton } from "@/components/quick-add-button";
import { WishlistEmptyIcon } from "@/components/wishlist-empty-icon";
import { formatMoney } from "@/lib/format";
import { applyTemplate } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function GuestWishlistClient({
  wishlistDict,
  addToCartLabel,
  locale,
}: {
  wishlistDict: Dictionary["wishlist"];
  addToCartLabel: string;
  locale: string;
}) {
  const items = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.removeItem);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16">
      <div className="from-primary/15 via-secondary/10 to-primary/0 border-primary/10 flex items-center gap-4 rounded-xl border bg-gradient-to-br px-6 py-6">
        <div className="from-primary to-secondary flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.8 4.6c-1.9-1.6-4.6-1.4-6.3.4L12 7.5l-2.5-2.5c-1.7-1.8-4.4-2-6.3-.4-2.1 1.8-2.2 5-.3 6.9L12 21l9.1-9.5c1.9-1.9 1.8-5.1-.3-6.9Z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-semibold">{wishlistDict.title}</h1>
          <p className="text-foreground/70 text-sm">
            {items.length > 0
              ? applyTemplate(wishlistDict.itemCount, { n: items.length })
              : wishlistDict.subtitle}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="border-primary/15 from-surface to-background mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed bg-gradient-to-b px-6 py-20 text-center">
          <WishlistEmptyIcon />
          <p className="text-foreground/70 text-sm">{wishlistDict.empty}</p>
          <Link href="/products" className="btn-primary mt-1 text-sm">
            {wishlistDict.browse}
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <li key={item.productId} className="group flex flex-col gap-2">
                <div className="bg-surface relative aspect-square w-full overflow-hidden rounded-lg transition-shadow duration-300 group-hover:shadow-lg">
                  <Link
                    href={`/products/${item.slug}`}
                    className="absolute inset-0"
                    aria-label={item.name}
                  >
                    {item.imageUrl && (
                      <CatalogImage
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                      />
                    )}
                  </Link>

                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    aria-label={wishlistDict.remove}
                    title={wishlistDict.remove}
                    className="bg-background/95 text-danger absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-transform duration-200 hover:scale-110 active:scale-95"
                  >
                    <span aria-hidden="true" className="text-base leading-none">
                      ♥
                    </span>
                  </button>

                  <QuickAddButton
                    product={{
                      id: item.productId,
                      slug: item.slug,
                      name: item.name,
                      price: item.price,
                      currency: item.currency,
                      imageUrl: item.imageUrl,
                    }}
                    label={addToCartLabel}
                  />
                </div>
                <Link
                  href={`/products/${item.slug}`}
                  className="group-hover:text-primary line-clamp-1 text-sm font-medium transition-colors"
                >
                  {item.name}
                </Link>
                <span className="text-foreground/70 text-sm">
                  {formatMoney(item.price, item.currency, locale)}
                </span>
              </li>
            ))}
          </ul>

          <p className="text-foreground/60 mt-8 text-sm">
            {wishlistDict.guestSyncNote}{" "}
            <Link href="/login?callbackUrl=/wishlist" className="text-primary hover:underline">
              {wishlistDict.signInToSync}
            </Link>
          </p>
        </>
      )}
    </main>
  );
}
