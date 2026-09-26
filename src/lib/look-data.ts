import { db } from "@/lib/db";
import type { Locale } from "@/lib/i18n/locale";
import {
  localizedDescription,
  localizedName,
  localizedStory,
  productImageAlt,
} from "@/lib/product-i18n";
import { LOOK_SIZE, lookPricing } from "@/lib/looks";
import { deriveProductType, type ProductType } from "@/lib/gift-finder";
import { productSizeDictKey, type SizeDictKey } from "@/lib/product-sizing";
import { isProductColorKey, type ProductColorKey } from "@/lib/product-colors";
import { truncateAtWord } from "@/lib/text";

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

const LOOK_INCLUDE = {
  products: {
    where: { active: true },
    orderBy: { createdAt: "asc" as const },
    include: {
      images: { take: 1, orderBy: { position: "asc" as const } },
      category: { select: { name: true, nameEn: true, slug: true } },
    },
  },
};

type LookRow = Awaited<
  ReturnType<typeof db.look.findMany<{ include: typeof LOOK_INCLUDE }>>
>[number];

// Only looks whose full set of pieces is active, since checkout discounts
// nothing less (lib/looks.ts).
function toLookViews(looks: LookRow[], locale: Locale): LookView[] {
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

// Active looks containing any of these products, with all their pieces.
export async function getLooksForProducts(
  productIds: string[],
  locale: Locale
): Promise<LookView[]> {
  if (productIds.length === 0) return [];
  const looks = await db.look.findMany({
    where: { active: true, products: { some: { id: { in: productIds } } } },
    include: LOOK_INCLUDE,
  });
  return toLookViews(looks, locale);
}

// Every active, complete look, newest first: the /looks page and the home
// page's looks section.
export async function getAllLooks(locale: Locale, take?: number): Promise<LookView[]> {
  const looks = await db.look.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    include: LOOK_INCLUDE,
  });
  const views = toLookViews(looks, locale);
  return take === undefined ? views : views.slice(0, take);
}

export async function getLookById(id: string, locale: Locale): Promise<LookView | null> {
  const look = await db.look.findFirst({ where: { id, active: true }, include: LOOK_INCLUDE });
  return look ? (toLookViews([look], locale)[0] ?? null) : null;
}

// The long-form copy the look page shows under each piece. Kept out of
// LookPieceView so the product page, home page and gift finder (which ship
// that view to the client) don't carry every description along.
export type LookPieceDetails = {
  description: string;
  story: string;
  sizeKey: SizeDictKey | null;
  color: ProductColorKey | null;
};

export async function getLookPieceDetails(
  productIds: string[],
  locale: Locale
): Promise<Record<string, LookPieceDetails>> {
  if (productIds.length === 0) return {};
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      description: true,
      descriptionEn: true,
      descriptionFr: true,
      descriptionDe: true,
      descriptionAr: true,
      descriptionZh: true,
      descriptionRu: true,
      descriptionEs: true,
      descriptionPt: true,
      descriptionHi: true,
      descriptionJa: true,
      story: true,
      storyEn: true,
      color: true,
      category: { select: { name: true, nameEn: true } },
    },
  });
  return Object.fromEntries(
    products.map((p) => [
      p.id,
      {
        description: localizedDescription(p, locale),
        story: localizedStory(p, locale),
        sizeKey: productSizeDictKey(p.category ?? null),
        color: isProductColorKey(p.color) ? p.color : null,
      },
    ])
  );
}

// What each product is (necklace, bracelet, earrings or none of those), from
// its category: the cart's estimate of the composed-look saving needs it.
export async function getPieceKinds(
  productIds: string[]
): Promise<Record<string, ProductType | null>> {
  if (productIds.length === 0) return {};
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, category: { select: { name: true, nameEn: true, slug: true } } },
  });
  return Object.fromEntries(products.map((p) => [p.id, deriveProductType(p.category)]));
}

export type ComposerPiece = Omit<LookPieceView, "kind"> & {
  kind: ProductType;
  description: string;
};

// Everything the look composer (/looks/compose) can offer, grouped by kind:
// active pieces with a photo whose category makes them a necklace, bracelet
// or earrings. In-stock pieces first.
export async function getComposerPieces(
  locale: Locale
): Promise<Record<ProductType, ComposerPiece[]>> {
  const products = await db.product.findMany({
    where: { active: true, images: { some: {} } },
    orderBy: { createdAt: "desc" },
    include: {
      images: { take: 1, orderBy: { position: "asc" } },
      category: { select: { name: true, nameEn: true, slug: true } },
    },
  });
  const groups: Record<ProductType, ComposerPiece[]> = {
    necklace: [],
    bracelet: [],
    earrings: [],
  };
  for (const product of products) {
    const kind = deriveProductType(product.category ?? null);
    if (!kind) continue;
    const name = localizedName(product, locale);
    const description = localizedDescription(product, locale) || localizedStory(product, locale);
    groups[kind].push({
      productId: product.id,
      slug: product.slug,
      name,
      price: product.price,
      currency: product.currency,
      imageUrl: product.images[0]?.url ?? null,
      imageAlt: productImageAlt(name, locale),
      available: !product.trackInventory || product.stockQty > 0,
      kind,
      description: truncateAtWord(description, 240),
    });
  }
  for (const kind of Object.keys(groups) as ProductType[]) {
    groups[kind].sort((a, b) => Number(b.available) - Number(a.available));
  }
  return groups;
}
