import { ARTICLES } from "@/lib/journal";
import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { locales } from "@/lib/i18n/locale-constants";
import { hreflangAlternates } from "@/lib/hreflang";

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

  // Every resource on the site as one unprefixed path + its own lastModified
  // — expanded into one sitemap entry per locale below, each carrying the
  // full hreflang cluster so Google can move between a resource's languages
  // directly from the sitemap. Google ignores <changefreq>/<priority>; only
  // <lastmod> is used, and only when accurate, so entries with no real
  // modification date omit it.
  const resources: { path: string; lastModified?: Date }[] = [
    { path: "/", lastModified: catalogUpdatedAt },
    { path: "/products", lastModified: catalogUpdatedAt },
    { path: "/gift-finder", lastModified: catalogUpdatedAt },
    { path: "/looks" },
    { path: "/looks/compose" },
    ...(settings.giftCardEnabled ? [{ path: "/personalised-gift-card" }] : []),
    ...looks.map((look) => ({ path: `/looks/${look.id}`, lastModified: look.updatedAt })),
    { path: "/about" },
    { path: "/murano-glass" },
    { path: "/contact" },
    { path: "/blog", lastModified: new Date(ARTICLES[0].updated ?? ARTICLES[0].published) },
    ...ARTICLES.map((article) => ({
      path: `/blog/${article.slug}`,
      lastModified: new Date(article.updated ?? article.published),
    })),
    ...categories.map((category) => ({
      path: `/category/${category.slug}`,
      lastModified: catalogUpdatedAt,
    })),
    ...products.map((product) => ({
      path: `/products/${product.slug}`,
      lastModified: product.updatedAt,
    })),
    ...legalPages.map((page) => ({ path: `/legal/${page.slug}`, lastModified: page.lastUpdated })),
  ];

  return resources.flatMap(({ path, lastModified }) => {
    const alternates = hreflangAlternates(path);
    const languages = Object.fromEntries(
      Object.entries(alternates).map(([code, altPath]) => [code, `${base}${altPath}`])
    );
    return locales.map((locale) => ({
      url: `${base}${alternates[locale]}`,
      lastModified,
      alternates: { languages },
    }));
  });
}
