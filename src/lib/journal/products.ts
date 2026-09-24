import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

type JournalProduct = Prisma.ProductGetPayload<{ include: { images: true } }>;

// The catalog pieces an article (or a list of articles) shows, by slug, with
// live prices and stock. Missing or inactive pieces are simply not returned,
// so a retired product never breaks an article.
export async function getJournalProducts(slugs: string[]): Promise<Map<string, JournalProduct>> {
  if (slugs.length === 0) return new Map();
  const products = await db.product.findMany({
    where: { slug: { in: [...new Set(slugs)] }, active: true },
    include: { images: { take: 1, orderBy: { position: "asc" } } },
  });
  return new Map(products.map((p) => [p.slug, p]));
}

export type JournalProductMap = Map<string, JournalProduct>;
