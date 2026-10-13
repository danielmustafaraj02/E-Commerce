import { db } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import type { Locale } from "@/lib/i18n/locale-constants";
import { localizedName } from "@/lib/product-i18n";

/** What a hero piece's card shows: the product's name, price and page. */
export type HeroProduct = { name: string; price: string; href: string; soldOut: boolean };

/**
 * Names and prices for the hero's pieces, in the visitor's language. Products
 * no longer on sale are left out, so their pieces simply have no card.
 */
export async function heroProducts(
  slugs: string[],
  locale: Locale,
  /** The store's default language, which formats the prices (as elsewhere). */
  catalogLocale: string
): Promise<Record<string, HeroProduct>> {
  if (!slugs.length) return {};
  try {
    const products = await db.product.findMany({
      where: { slug: { in: slugs }, active: true, unlisted: false },
      select: {
        slug: true,
        name: true,
        nameEn: true,
        nameFr: true,
        nameDe: true,
        nameAr: true,
        nameZh: true,
        nameRu: true,
        nameEs: true,
        namePt: true,
        nameHi: true,
        nameJa: true,
        price: true,
        currency: true,
        stockQty: true,
        trackInventory: true,
      },
    });
    return Object.fromEntries(
      products.map((p) => [
        p.slug,
        {
          name: localizedName(p, locale),
          price: formatMoney(p.price, p.currency, catalogLocale),
          href: `/${locale}/products/${p.slug}`,
          soldOut: p.trackInventory && p.stockQty <= 0,
        },
      ])
    );
  } catch {
    // Cards are a nicety: without them the hero still works.
    return {};
  }
}
