import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { localizedName, localizedDescription } from "@/lib/product-i18n";
import { absoluteUrl } from "@/lib/json-ld";
import { siteBaseUrl } from "@/lib/site-url";
import {
  MAX_ADDITIONAL_IMAGES,
  feedTitle,
  googleProductCategory,
  productMaterial,
} from "@/lib/merchant-feed";
import type { Locale } from "@/lib/i18n/locale";
import { rateLimit, clientIp } from "@/lib/rate-limit";

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
  const { success } = await rateLimit(`google-merchant-feed:${clientIp(request)}`, 20, 60_000);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { searchParams } = new URL(request.url);
  const locale: Locale = searchParams.get("locale") === "en" ? "en" : "it";

  const settings = await getStoreSettings();
  const base = siteBaseUrl(settings);

  const products = await db.product.findMany({
    where: { active: true },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 + MAX_ADDITIONAL_IMAGES },
      category: true,
    },
  });

  const items = products
    .filter((product) => product.images.length > 0)
    .map((product) => {
      const name = localizedName(product, locale);
      const description = localizedDescription(product, locale) || name;
      const price = (product.price / 100).toFixed(2);
      const availability = product.stockQty > 0 ? "in stock" : "out of stock";
      // Product images can be a relative path (self-hosted under /public) or
      // an admin-pasted absolute URL — Google requires fully-qualified links.
      const [mainImage, ...extraImages] = product.images.map((image) =>
        absoluteUrl(image.url, base)
      );
      const googleCategory = googleProductCategory(product.category);
      const material = productMaterial(product.category);

      return `
    <item>
      <g:id>${xmlEscape(product.sku)}</g:id>
      <title>${xmlEscape(feedTitle(name, locale))}</title>
      <description>${xmlEscape(description)}</description>
      <link>${xmlEscape(`${base}/products/${product.slug}`)}</link>
      <g:image_link>${xmlEscape(mainImage)}</g:image_link>
      ${extraImages.map((url) => `<g:additional_image_link>${xmlEscape(url)}</g:additional_image_link>`).join("\n      ")}
      <g:availability>${availability}</g:availability>
      <g:price>${price} ${xmlEscape(product.currency)}</g:price>
      <g:condition>new</g:condition>
      <g:brand>${xmlEscape(settings.storeName)}</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      ${material ? `<g:material>${xmlEscape(material)}</g:material>` : ""}
      ${googleCategory ? `<g:google_product_category>${xmlEscape(googleCategory)}</g:google_product_category>` : ""}
      ${product.category ? `<g:product_type>${xmlEscape(localizedName(product.category, locale))}</g:product_type>` : ""}
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
