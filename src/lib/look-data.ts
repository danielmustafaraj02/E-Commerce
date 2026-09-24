import { db } from "@/lib/db";
import type { Locale } from "@/lib/i18n/locale";
import { localizedName, productImageAlt } from "@/lib/product-i18n";
import { LOOK_SIZE, lookPricing } from "@/lib/looks";
import { deriveProductType, type ProductType } from "@/lib/gift-finder";

export type LookPieceView = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  imageAlt: string;
  available: boolean;
  // Necklace, bracelet or earrings (from the category), for the composition.
  kind: ProductType | null;
};

export type LookView = {
  id: string;
  name: string;
  imageUrl: string | null;
  discountPercent: number;
  pieces: LookPieceView[];
  pricing: ReturnType<typeof lookPricing>;
  // Every piece can be bought: the set (and its discount) is offered only then.
  available: boolean;
};

// Active looks containing any of these products, with all their pieces —
// only looks whose full set of pieces is active, since checkout discounts
// nothing less (lib/looks.ts).
export async function getLooksForProducts(
  productIds: string[],
  locale: Locale
): Promise<LookView[]> {
  if (productIds.length === 0) return [];

  const looks = await db.look.findMany({
    where: { active: true, products: { some: { id: { in: productIds } } } },
    include: {
      products: {
        where: { active: true },
        orderBy: { createdAt: "asc" },
        include: {
          images: { take: 1, orderBy: { position: "asc" } },
          category: { select: { name: true, nameEn: true, slug: true } },
        },
      },
    },
  });

  return looks
    .filter((look) => look.products.length === LOOK_SIZE)
    .map((look) => {
      const pieces = look.products.map((product) => {
        const name = localizedName(product, locale);
        return {
          productId: product.id,
          slug: product.slug,
          name,
          price: product.price,
          currency: product.currency,
          imageUrl: product.images[0]?.url ?? null,
          imageAlt: productImageAlt(name, locale),
          available: !product.trackInventory || product.stockQty > 0,
          kind: deriveProductType(product.category ?? null),
        };
      });
      return {
        id: look.id,
        name: look.name,
        imageUrl: look.imageUrl,
        discountPercent: look.discountPercent,
        pieces,
        pricing: lookPricing(
          pieces.map((p) => p.price),
          look.discountPercent
        ),
        available: pieces.every((p) => p.available),
      };
    });
}
