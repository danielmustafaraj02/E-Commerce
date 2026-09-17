import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { localizedName, localizedDescription } from "@/lib/product-i18n";
import type { Locale } from "@/lib/i18n/locale";

// Google Merchant Center product feed (RSS 2.0 + the `g:` namespace Google
// defines) — https://support.google.com/merchants/answer/7052112. Point a
// Merchant Center "Scheduled fetch" at this URL to keep your product catalog
// in sync automatically; no separate feed-management tool (Channable etc.)
// needed. `?locale=en` switches to the English name/description fields
// (falls back to Italian for any product without an English translation).
function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale: Locale = searchParams.get("locale") === "en" ? "en" : "it";

  const settings = await getStoreSettings();
  const base = settings.siteUrl || process.env.NEXTAUTH_URL || "http://localhost:3000";

  const products = await db.product.findMany({
    where: { active: true },
    include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
  });

  const items = products
    .filter((product) => product.images.length > 0)
    .map((product) => {
      const name = localizedName(product, locale);
      const description = localizedDescription(product, locale) || name;
      const price = (product.price / 100).toFixed(2);
      const availability = product.stockQty > 0 ? "in stock" : "out of stock";
      // Product images can be a relative path (self-hosted under /public)
      // or an admin-pasted absolute URL — Google requires image_link to
      // always be fully-qualified.
      const imageUrl = product.images[0].url.startsWith("http")
        ? product.images[0].url
        : `${base}${product.images[0].url.startsWith("/") ? "" : "/"}${product.images[0].url}`;

      return `
    <item>
      <g:id>${xmlEscape(product.sku)}</g:id>
      <title>${xmlEscape(name)}</title>
      <description>${xmlEscape(description)}</description>
      <link>${xmlEscape(`${base}/products/${product.slug}`)}</link>
      <g:image_link>${xmlEscape(imageUrl)}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${price} ${xmlEscape(product.currency)}</g:price>
      <g:condition>new</g:condition>
      <g:brand>${xmlEscape(settings.storeName)}</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      ${product.category ? `<g:product_type>${xmlEscape(product.category.name)}</g:product_type>` : ""}
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${xmlEscape(settings.storeName)}</title>
    <link>${xmlEscape(base)}</link>
    <description>${xmlEscape(settings.storeName)} product feed</description>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
