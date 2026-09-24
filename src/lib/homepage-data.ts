import { unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

const REVENUE_STATUSES = ["paid", "processing", "shipped", "delivered"];

// The number of pieces shown in the homepage "Special Selection" band.
export const SPECIAL_SELECTION_SIZE = 4;

// Keeps only products with a genuine discount (compareAtPrice set and higher
// than price — staff can set the former without the latter changing, e.g.
// while drafting), deepest discount first. Pure so it's testable without a
// database: the Prisma query just needs to hand it active products that have
// a compareAtPrice set at all.
export function pickSpecialSelection<T extends { price: number; compareAtPrice: number | null }>(
  products: T[],
  take = SPECIAL_SELECTION_SIZE
): T[] {
  return products
    .filter((product) => product.compareAtPrice !== null && product.compareAtPrice > product.price)
    .sort((a, b) => {
      const discountOf = (p: T) => (p.compareAtPrice! - p.price) / p.compareAtPrice!;
      return discountOf(b) - discountOf(a);
    })
    .slice(0, take);
}

// The piece shown on each "Shop by category" tile, by product slug: the same one
// every visit. If one of these products is deleted or deactivated, that tile falls
// back to the category's oldest active product, so it is still never random.
export const CATEGORY_COVER_PRODUCT_SLUGS = [
  "bracciale-rame-di-mezzanotte-ca793a", // Midnight Copper Bracelet
  "collana-fiore-notturno-15492b", // Night Flower Necklace
  "orecchini-goccia-di-rubino-9ad623", // Ruby Drop Earrings
];

// The homepage previously ran ~9 sequential/near-sequential DB round trips
// (including one raw query per category for its random image) on every
// single request, which is most of what was dragging down the Real
// Experience Score in Vercel Speed Insights. None of this data is
// per-visitor, so it's cached for a short window instead of refetched from
// Neon on every load — a stale-for-up-to-60s homepage is an easy trade for
// visitors not waiting on ~9 database round trips.
export const getHomepageData = unstable_cache(
  async () => {
    const [products, specialSelectionCandidates, categories, topSellingItems, reviews] =
      await Promise.all([
        db.product.findMany({
          where: { active: true },
          take: 8,
          orderBy: { createdAt: "desc" },
          include: { images: { take: 1, orderBy: { position: "asc" } } },
        }),
        // A generous candidate pool (compareAtPrice set at all) — the real
        // "> price" and "deepest discount first" filtering happens in JS via
        // pickSpecialSelection, since Prisma can't compare two columns
        // against each other in a `where`.
        db.product.findMany({
          where: { active: true, compareAtPrice: { not: null } },
          take: 24,
          orderBy: { updatedAt: "desc" },
          include: { images: { take: 1, orderBy: { position: "asc" } } },
        }),
        db.category.findMany({ where: { parentId: null }, orderBy: { name: "asc" }, take: 6 }),
        db.orderItem.groupBy({
          by: ["productId"],
          where: { order: { status: { in: REVENUE_STATUSES } } },
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: "desc" } },
          take: 10,
        }),
        // Only real, written reviews — never fabricated copy. Highest-rated
        // first so the shelf leads with the store's best real feedback.
        db.review.findMany({
          where: { comment: { not: null } },
          orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
          take: 9,
          include: {
            user: { select: { name: true } },
            product: { select: { name: true, nameEn: true } },
          },
        }),
      ]);

    // Best sellers is real sales data (not a fixed shelf), so it fetches by
    // ID in ranked order rather than a single findMany — a plain where-in
    // query would come back in whatever order the database feels like.
    const [bestSellersUnordered, categoryImages] = await Promise.all([
      db.product.findMany({
        where: { id: { in: topSellingItems.map((item) => item.productId) }, active: true },
        include: { images: { take: 1, orderBy: { position: "asc" } } },
      }),
      // One product image per category in a single round trip (DISTINCT ON), the
      // pinned cover product first, else the category's oldest active product. Always
      // that product's first photo, and no RANDOM(): the tile must not change per visit.
      categories.length > 0
        ? db.$queryRaw<{ categoryId: string; url: string; altText: string }[]>`
            SELECT DISTINCT ON ("Product"."categoryId") "Product"."categoryId" as "categoryId",
              "ProductImage"."url" as url, "ProductImage"."altText" as altText
            FROM "ProductImage"
            JOIN "Product" ON "Product"."id" = "ProductImage"."productId"
            WHERE "Product"."categoryId" IN (${Prisma.join(categories.map((c) => c.id))})
              AND "Product"."active" = true
            ORDER BY "Product"."categoryId",
              ("Product"."slug" IN (${Prisma.join(CATEGORY_COVER_PRODUCT_SLUGS)})) DESC,
              "Product"."createdAt", "Product"."id", "ProductImage"."position"
          `
        : Promise.resolve([] as { categoryId: string; url: string; altText: string }[]),
    ]);

    const bestSellers = topSellingItems
      .map((item) => bestSellersUnordered.find((p) => p.id === item.productId))
      .filter((p) => p !== undefined);

    const imageByCategoryId = new Map(categoryImages.map((image) => [image.categoryId, image]));
    const categoriesWithImage = categories.map((category) => ({
      ...category,
      image: imageByCategoryId.get(category.id) ?? null,
    }));

    const specialSelection = pickSpecialSelection(specialSelectionCandidates);

    return { products, specialSelection, categoriesWithImage, bestSellers, reviews };
  },
  ["homepage-data"],
  { revalidate: 60, tags: ["homepage"] }
);
