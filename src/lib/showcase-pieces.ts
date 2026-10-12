import { db } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { localizedName } from "@/lib/product-i18n";
import type { Locale } from "@/lib/i18n/locale-constants";
import { getLookPageCopy } from "@/lib/i18n/look-page-copy";

/** The product shown in a showcase scene's hover card. */
export type ShowcasePiece = { name: string; href: string; price: string; compare?: string; cta: string };

/**
 * For each scene: the product chosen in the editor (`product` slug), else the
 * product whose photo the scene shows. Scenes with neither get no card.
 */
export async function showcasePieces(
  scenes: { image: string; product?: string }[],
  locale: Locale,
  moneyLocale: string
): Promise<(ShowcasePiece | undefined)[]> {
  try {
    const slugs = scenes.flatMap((s) => (s.product ? [s.product] : []));
    const images = scenes.filter((s) => !s.product).map((s) => s.image);
    const select = {
      slug: true,
      name: true,
      nameEn: true,
      price: true,
      compareAtPrice: true,
      currency: true,
      images: { select: { url: true }, orderBy: { position: "asc" as const } },
    };
    const products = await db.product.findMany({
      where: {
        active: true,
        OR: [{ slug: { in: slugs } }, { images: { some: { url: { in: images } } } }],
      },
      select,
    });
    const cta = getLookPageCopy(locale).viewPiece;
    return scenes.map((scene) => {
      const product = scene.product
        ? products.find((p) => p.slug === scene.product)
        : products.find((p) => p.images.some((i) => i.url === scene.image));
      if (!product) return undefined;
      return {
        name: localizedName(product, locale),
        href: `/products/${product.slug}`,
        price: formatMoney(product.price, product.currency, moneyLocale),
        compare:
          product.compareAtPrice && product.compareAtPrice > product.price
            ? formatMoney(product.compareAtPrice, product.currency, moneyLocale)
            : undefined,
        cta,
      };
    });
  } catch {
    return scenes.map(() => undefined);
  }
}
