import Link from "next/link";
import { CatalogImage } from "@/components/catalog-image";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { applyTemplate } from "@/lib/i18n/format";
import { formatMoney } from "@/lib/format";
import { toggleWishlist } from "@/app/products/[slug]/wishlist-actions";
import { QuickAddButton } from "@/components/quick-add-button";
import { ShelfMain } from "@/components/shelf-main";
import { ShelfHead, ShelfBody } from "@/components/shelf-page";
import { WishlistEmptyIcon } from "@/components/wishlist-empty-icon";

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/wishlist");

  const [settings, uiLocale, items] = await Promise.all([
    getStoreSettings(),
    getLocale(),
    db.wishlistItem.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { product: { include: { images: { take: 1, orderBy: { position: "asc" } } } } },
    }),
  ]);
  const dict = getDictionary(uiLocale);

  return (
    <ShelfMain>
      <ShelfHead
        width="full"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.8 4.6c-1.9-1.6-4.6-1.4-6.3.4L12 7.5l-2.5-2.5c-1.7-1.8-4.4-2-6.3-.4-2.1 1.8-2.2 5-.3 6.9L12 21l9.1-9.5c1.9-1.9 1.8-5.1-.3-6.9Z" />
          </svg>
        }
        title={dict.wishlist.title}
      >
        <p className="shop-lede">
          {items.length > 0
            ? applyTemplate(dict.wishlist.itemCount, { n: items.length })
            : dict.wishlist.subtitle}
        </p>
      </ShelfHead>
      <ShelfBody width="full">
        {items.length === 0 ? (
          <div className="shop-panel shop-empty">
            <WishlistEmptyIcon />
            <p className="text-foreground/70 text-sm">{dict.wishlist.empty}</p>
            <Link href="/products" className="btn-primary mt-1 text-sm">
              {dict.wishlist.browse}
            </Link>
          </div>
        ) : (
          <ul className="shelf-row">
            {items.map((item) => {
              const removeAction = async () => {
                "use server";
                await toggleWishlist(item.product.id, item.product.slug);
              };
              const outOfStock = item.product.stockQty <= 0;
              const image = item.product.images[0];

              return (
                <li key={item.id} className="shelf-item group">
                  <div className="shelf-item-photo">
                    {image && (
                      <CatalogImage
                        src={image.url}
                        alt={image.altText || item.product.name}
                        fill
                        sizes="(min-width: 64rem) 15rem, (min-width: 48rem) 25vw, 50vw"
                      />
                    )}

                    {outOfStock && <span className="shelf-badge">{dict.product.outOfStock}</span>}

                    <form action={removeAction} className="absolute top-2 right-2 z-10">
                      <button
                        type="submit"
                        aria-label={dict.wishlist.remove}
                        title={dict.wishlist.remove}
                        className="bg-background/95 text-danger flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-transform duration-200 hover:scale-110 active:scale-95"
                      >
                        <span aria-hidden="true" className="text-base leading-none">
                          ♥
                        </span>
                      </button>
                    </form>

                    {!outOfStock && (
                      <QuickAddButton
                        product={{
                          id: item.product.id,
                          slug: item.product.slug,
                          name: item.product.name,
                          price: item.product.price,
                          currency: item.product.currency,
                          imageUrl: image?.url ?? null,
                        }}
                        label={dict.product.addToCart}
                      />
                    )}
                  </div>
                  <h3 className="shelf-item-name">
                    <Link href={`/products/${item.product.slug}`}>{item.product.name}</Link>
                  </h3>
                  <span className="shelf-item-price">
                    {formatMoney(item.product.price, item.product.currency, settings.defaultLocale)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </ShelfBody>
    </ShelfMain>
  );
}
