import Link from "next/link";
import Image from "next/image";
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
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16">
      <div className="from-primary/15 via-secondary/10 to-primary/0 border-primary/10 flex items-center gap-4 rounded-xl border bg-gradient-to-br px-6 py-6">
        <div className="from-primary to-secondary flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-sm">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M20.8 4.6c-1.9-1.6-4.6-1.4-6.3.4L12 7.5l-2.5-2.5c-1.7-1.8-4.4-2-6.3-.4-2.1 1.8-2.2 5-.3 6.9L12 21l9.1-9.5c1.9-1.9 1.8-5.1-.3-6.9Z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-semibold">{dict.wishlist.title}</h1>
          <p className="text-foreground/70 text-sm">
            {items.length > 0
              ? applyTemplate(dict.wishlist.itemCount, { n: items.length })
              : dict.wishlist.subtitle}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="border-primary/15 from-surface to-background mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed bg-gradient-to-b px-6 py-20 text-center">
          <WishlistEmptyIcon />
          <p className="text-foreground/70 text-sm">{dict.wishlist.empty}</p>
          <Link href="/products" className="btn-primary mt-1 text-sm">
            {dict.wishlist.browse}
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const removeAction = async () => {
              "use server";
              await toggleWishlist(item.product.id, item.product.slug);
            };
            const outOfStock = item.product.stockQty <= 0;
            const image = item.product.images[0];

            return (
              <li key={item.id} className="group flex flex-col gap-2">
                <div className="bg-surface relative aspect-square w-full overflow-hidden rounded-lg transition-shadow duration-300 group-hover:shadow-lg">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="absolute inset-0"
                    aria-label={item.product.name}
                  >
                    {image && (
                      <Image
                        src={image.url}
                        alt={image.altText || item.product.name}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                      />
                    )}
                  </Link>

                  {outOfStock && (
                    <span className="bg-foreground text-background absolute top-2 left-2 rounded px-2 py-0.5 text-xs">
                      {dict.product.outOfStock}
                    </span>
                  )}

                  <form action={removeAction} className="absolute top-2 right-2">
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
                <Link
                  href={`/products/${item.product.slug}`}
                  className="group-hover:text-primary line-clamp-1 text-sm font-medium transition-colors"
                >
                  {item.product.name}
                </Link>
                <span className="text-foreground/70 text-sm">
                  {formatMoney(item.product.price, item.product.currency, settings.defaultLocale)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
