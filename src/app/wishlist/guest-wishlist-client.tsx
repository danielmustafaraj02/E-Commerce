"use client";

import { EmptyShelf } from "@/components/empty-shelf";
import Link from "next/link";
import { CatalogImage } from "@/components/catalog-image";
import { useWishlistStore } from "@/lib/wishlist-store";
import { QuickAddButton } from "@/components/quick-add-button";
import { ShelfHead, ShelfBody } from "@/components/shelf-page";
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
    <>
      <ShelfHead
        width="full"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.8 4.6c-1.9-1.6-4.6-1.4-6.3.4L12 7.5l-2.5-2.5c-1.7-1.8-4.4-2-6.3-.4-2.1 1.8-2.2 5-.3 6.9L12 21l9.1-9.5c1.9-1.9 1.8-5.1-.3-6.9Z" />
          </svg>
        }
        title={wishlistDict.title}
      >
        <p className="shop-lede">
          {items.length > 0
            ? applyTemplate(wishlistDict.itemCount, { n: items.length })
            : wishlistDict.subtitle}
        </p>
      </ShelfHead>
      <ShelfBody width="full">
        {items.length === 0 ? (
          <EmptyShelf
            icon="heart"
            title={wishlistDict.empty}
            body={wishlistDict.emptyBody}
            cta={wishlistDict.browse}
          />
        ) : (
          <>
            <ul className="shelf-row">
              {items.map((item) => (
                <li key={item.productId} className="shelf-item group">
                  <div className="shelf-item-photo">
                    {item.imageUrl && (
                      <CatalogImage
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="(min-width: 64rem) 15rem, (min-width: 48rem) 25vw, 50vw"
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      aria-label={wishlistDict.remove}
                      title={wishlistDict.remove}
                      className="bg-background/95 text-danger absolute top-2 right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-transform duration-200 hover:scale-110 active:scale-95"
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
                  <h3 className="shelf-item-name">
                    <Link href={`/products/${item.slug}`}>{item.name}</Link>
                  </h3>
                  <span className="shelf-item-price">
                    {formatMoney(item.price, item.currency, locale)}
                  </span>
                </li>
              ))}
            </ul>

            <p className="text-foreground/60 mt-8 text-sm">
              {wishlistDict.guestSyncNote}{" "}
              <Link href="/login?callbackUrl=/wishlist" className="shelf-link">
                {wishlistDict.signInToSync}
              </Link>
            </p>
          </>
        )}
      </ShelfBody>
    </>
  );
}
