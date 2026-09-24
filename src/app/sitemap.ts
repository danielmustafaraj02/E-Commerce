import { ARTICLES } from "@/lib/journal";
import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getStoreSettings();
  const base = settings.siteUrl || process.env.NEXTAUTH_URL || "http://localhost:3000";

  const [products, categories, legalPages, looks] = await Promise.all([
    db.product.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
    db.category.findMany({ select: { slug: true } }),
    db.legalPage.findMany({ select: { slug: true, lastUpdated: true } }),
    db.look.findMany({ where: { active: true }, select: { id: true, updatedAt: true } }),
  ]);

  // The newest product edit is the best available "last changed" signal for
  // the pages that list products.
  const catalogUpdatedAt = products.reduce<Date | undefined>(
    (latest, product) => (!latest || product.updatedAt > latest ? product.updatedAt : latest),
    undefined
  );

  // Google ignores <changefreq> and <priority>; only <lastmod> is used, and
  // only when it is accurate — so pages with no real modification date omit it.
  return [
    { url: base, lastModified: catalogUpdatedAt },
    { url: `${base}/products`, lastModified: catalogUpdatedAt },
    { url: `${base}/gift-finder`, lastModified: catalogUpdatedAt },
    { url: `${base}/looks` },
    ...looks.map((look) => ({ url: `${base}/looks/${look.id}`, lastModified: look.updatedAt })),
    { url: `${base}/about` },
    { url: `${base}/murano-glass` },
    { url: `${base}/contact` },
    { url: `${base}/blog`, lastModified: new Date(ARTICLES[0].updated ?? ARTICLES[0].published) },
    ...ARTICLES.map((article) => ({
      url: `${base}/blog/${article.slug}`,
      lastModified: new Date(article.updated ?? article.published),
    })),
    ...categories.map((category) => ({
      url: `${base}/category/${category.slug}`,
      lastModified: catalogUpdatedAt,
    })),
    ...products.map((product) => ({
      url: `${base}/products/${product.slug}`,
      lastModified: product.updatedAt,
    })),
    ...legalPages.map((page) => ({
      url: `${base}/legal/${page.slug}`,
      lastModified: page.lastUpdated,
    })),
  ];
}
