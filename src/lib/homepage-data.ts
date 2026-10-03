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

// The homepage previously ran ~9 sequential/near-sequential DB round trips
// (including one raw query per category for its random image) on every
// single request, which is most of what was dragging down the Real
// Experience Score in Vercel Speed Insights. None of this data is
// per-visitor, so it's cached for a short window instead of refetched from
// Neon on every load — a stale-for-up-to-60s homepage is an easy trade for
// visitors not waiting on ~9 database round trips.
// The piece worn in the hero film. The film is a fixed asset
// (/hero/hero-atelier.*) showing one necklace, so the link between the two is
// a constant here rather than a guess made at render time: the card must show
// the real product or nothing at all.
export const HERO_VIDEO_PRODUCT_SLUG = "collana-rame-antico-85514c";

export const getHomepageData = unstable_cache(
  async () => {
    const [
      products,
      specialSelectionCandidates,
      categories,
      heroProduct,
      topSellingItems,
      reviews,
      popularByType,
    ] = await Promise.all([
        db.product.findMany({
          where: { active: true, unlisted: false },
          take: 8,
          orderBy: { createdAt: "desc" },
          include: { images: { take: 1, orderBy: { position: "asc" } } },
        }),
        // A generous candidate pool (compareAtPrice set at all) — the real
        // "> price" and "deepest discount first" filtering happens in JS via
        // pickSpecialSelection, since Prisma can't compare two columns
        // against each other in a `where`.
        db.product.findMany({
          where: { active: true, unlisted: false, compareAtPrice: { not: null } },
          take: 24,
          orderBy: { updatedAt: "desc" },
          include: { images: { take: 1, orderBy: { position: "asc" } } },
        }),
        db.category.findMany({ where: { parentId: null }, orderBy: { name: "asc" }, take: 6 }),
        // Null whenever the piece is missing, deactivated, unlisted or has no
        // photo — the hero card then simply never appears, rather than
        // rendering a placeholder for a product nobody can buy.
        db.product.findFirst({
          where: { slug: HERO_VIDEO_PRODUCT_SLUG, active: true, unlisted: false },
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
            compareAtPrice: true,
            images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
          },
        }),
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
        // Popular carousel: staff-pinned products take priority. When fewer
        // than 10 are pinned we also fetch a balanced pool of the three
        // category types and fill up from there (shuffled so the mix varies).
        Promise.all([
          db.product.findMany({
            where: { active: true, unlisted: false, featuredInCarousel: true },
            include: { images: { take: 1, orderBy: { position: "asc" } } },
          }),
          db.product.findMany({
            where: { active: true, unlisted: false, category: { slug: { startsWith: "collane" } } },
            take: 10,
            include: { images: { take: 1, orderBy: { position: "asc" } } },
          }),
          db.product.findMany({
            where: { active: true, unlisted: false, category: { slug: { startsWith: "bracciali" } } },
            take: 10,
            include: { images: { take: 1, orderBy: { position: "asc" } } },
          }),
          db.product.findMany({
            where: { active: true, unlisted: false, category: { slug: { startsWith: "orecchini" } } },
            take: 10,
            include: { images: { take: 1, orderBy: { position: "asc" } } },
          }),
        ]),
      ]);

    // Best sellers is real sales data (not a fixed shelf), so it fetches by
    // ID in ranked order rather than a single findMany — a plain where-in
    // query would come back in whatever order the database feels like.
    const [bestSellersUnordered, categoryImages] = await Promise.all([
      db.product.findMany({
        where: { id: { in: topSellingItems.map((item) => item.productId) }, active: true, unlisted: false },
        include: { images: { take: 1, orderBy: { position: "asc" } } },
      }),
      // One product image per category in a single round trip (DISTINCT ON): the
      // cover product chosen in Admin > Categories first, else the category's
      // oldest active product. Always that product's first photo, and no
      // RANDOM(): the tile must not change per visit. The join to "Category"
      // is what lets the ORDER BY compare against each row's own cover.
      categories.length > 0
        ? db.$queryRaw<{ categoryId: string; url: string; altText: string }[]>`
            SELECT DISTINCT ON ("Product"."categoryId") "Product"."categoryId" as "categoryId",
              "ProductImage"."url" as url, "ProductImage"."altText" as altText
            FROM "ProductImage"
            JOIN "Product" ON "Product"."id" = "ProductImage"."productId"
            JOIN "Category" ON "Category"."id" = "Product"."categoryId"
            WHERE "Product"."categoryId" IN (${Prisma.join(categories.map((c) => c.id))})
              AND "Product"."active" = true
              AND "Product"."unlisted" = false
            ORDER BY "Product"."categoryId",
              ("Product"."id" = "Category"."coverProductId") DESC,
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

    // Staff-pinned products always appear first; fill remaining slots from
    // an interleaved, shuffled pool of the three category types.
    const [pinned, necklaces, bracelets, earrings] = popularByType;
    const pinnedWithImage = pinned.filter((p) => p.images.length > 0);

    const interleaved: typeof necklaces = [];
    const pinnedIds = new Set(pinnedWithImage.map((p) => p.id));
    const maxLen = Math.max(necklaces.length, bracelets.length, earrings.length);
    for (let i = 0; i < maxLen; i++) {
      if (necklaces[i] && !pinnedIds.has(necklaces[i].id)) interleaved.push(necklaces[i]);
      if (bracelets[i] && !pinnedIds.has(bracelets[i].id)) interleaved.push(bracelets[i]);
      if (earrings[i] && !pinnedIds.has(earrings[i].id)) interleaved.push(earrings[i]);
    }
    const fallback = interleaved.filter((p) => p.images.length > 0);
    for (let i = fallback.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [fallback[i], fallback[j]] = [fallback[j], fallback[i]];
    }
    const popularProducts = [...pinnedWithImage, ...fallback].slice(0, 10);

    return { products, specialSelection, categoriesWithImage, heroProduct, bestSellers, reviews, popularProducts };
  },
  ["homepage-data"],
  { revalidate: 60, tags: ["homepage"] }
);
