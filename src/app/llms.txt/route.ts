import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { localizedName, localizedDescription } from "@/lib/product-i18n";
import { truncateAtWord } from "@/lib/text";
import { defaultLocale } from "@/lib/i18n/locale-constants";

// /llms.txt — a plain-Markdown map of the site for AI assistants and answer
// engines (the llms.txt convention: an H1, a one-line summary, then linked
// sections). It's an emerging, unofficial standard, so treat it as a cheap way
// to hand crawlers a clean, current index of what the store sells and where the
// policies live — not a ranking lever. Built from the same public data as the
// sitemap; nothing here is private.
export const revalidate = 3600;

export async function GET() {
  const settings = await getStoreSettings();
  // Every link below is written in English (localizedName/localizedDescription
  // are called with "en" throughout this file), so links point at the /en/
  // URLs explicitly rather than bare paths — a bare path would 308-redirect
  // to whichever locale the crawler's own Accept-Language resolves to, which
  // may not be English, mismatching the language of the content described.
  const base = `${settings.siteUrl || process.env.NEXTAUTH_URL || "http://localhost:3000"}/${defaultLocale}`;

  const [categories, products, legalPages] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.product.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    db.legalPage.findMany({ select: { slug: true, title: true }, orderBy: { slug: "asc" } }),
  ]);

  const summary =
    settings.metaDescription ||
    `${settings.storeName} sells handmade Murano glass jewelry — bracelets, necklaces and earrings.`;

  const lines: string[] = [
    `# ${settings.storeName}`,
    "",
    `> ${summary}`,
    "",
    "The storefront is available in English, Italian, French, German, Arabic, Chinese, Russian, Spanish, Portuguese, Hindi and Japanese, each at its own /xx/ URL prefix (this page links to the English ones). " +
      `Prices are shown in ${settings.defaultCurrency}${settings.pricesIncludeTax ? " and include VAT" : ""}.`,
    "",
    "## Shop",
    `- [All products](${base}/products): the full catalog, filterable by price and availability`,
    ...categories.map(
      (category) =>
        `- [${localizedName(category, "en")}](${base}/category/${category.slug}): ${localizedName(category, "en")} collection`
    ),
    "",
    "## Guides",
    `- [About Murano glass](${base}/murano-glass): how Murano glass is made, its techniques, and how to care for it`,
    `- [About us](${base}/about)`,
    "",
    "## Policies and contact",
    ...legalPages.map((page) => `- [${page.title}](${base}/legal/${page.slug})`),
    `- [Contact](${base}/contact)${settings.contactEmail ? `: ${settings.contactEmail}` : ""}`,
    "",
    "## Products",
    ...products.map((product) => {
      const blurb = truncateAtWord(localizedDescription(product, "en") ?? "", 110);
      return `- [${localizedName(product, "en")}](${base}/products/${product.slug})${blurb ? `: ${blurb}` : ""}`;
    }),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
