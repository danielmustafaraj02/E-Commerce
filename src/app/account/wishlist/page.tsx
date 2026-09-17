import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatMoney } from "@/lib/format";
import { toggleWishlist } from "@/app/products/[slug]/wishlist-actions";

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
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16">
      <h1 className="mb-6 text-2xl font-semibold">{dict.wishlist.title}</h1>

      {items.length === 0 ? (
        <div className="border-foreground/10 bg-surface flex flex-col items-center gap-3 rounded-lg border px-6 py-16 text-center">
          <p className="text-foreground/70 text-sm">{dict.wishlist.empty}</p>
          <Link
            href="/products"
            className="bg-primary rounded px-5 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:opacity-90"
          >
            {dict.wishlist.browse}
          </Link>
        </div>
      ) : (
        <ul className="border-foreground/10 bg-surface divide-foreground/10 flex flex-col divide-y overflow-hidden rounded-lg border">
          {items.map((item) => {
            const removeAction = async () => {
              "use server";
              await toggleWishlist(item.product.id, item.product.slug);
            };
            return (
              <li key={item.id} className="flex items-center gap-4 p-4">
                {item.product.images[0] && (
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="bg-background relative h-20 w-20 shrink-0 overflow-hidden rounded-lg"
                  >
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.images[0].altText || item.product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </Link>
                )}
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="hover:text-primary line-clamp-1 font-medium transition-colors"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-foreground/70 mt-0.5 text-sm">
                    {formatMoney(item.product.price, item.product.currency, settings.defaultLocale)}
                  </p>
                  <form action={removeAction}>
                    <button
                      type="submit"
                      className="text-foreground/50 hover:text-danger mt-1 text-xs transition-colors"
                    >
                      {dict.wishlist.remove}
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
