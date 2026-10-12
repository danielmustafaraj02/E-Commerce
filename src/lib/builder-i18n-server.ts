import { cache } from "react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import type { Locale } from "@/lib/i18n/locale-constants";
import { getShopCopy } from "@/lib/i18n/shop-copy";
import { getLookPageCopy } from "@/lib/i18n/look-page-copy";
import { getShowcaseCopy } from "@/lib/i18n/showcase-copy";
import { applyHomeCopy, parseHomeCopy } from "@/lib/home-copy";
import { getStoreSettings } from "@/lib/store-settings";
import {
  dictionaryText,
  docNeedsLocalizing,
  flattenDictionary,
  localizeDoc,
} from "@/lib/builder-i18n";
import type { BuilderDoc } from "@/lib/section-builder";

/** All the site's text in one language, as one object: the dictionary (with
 *  Admin > Settings > Page text applied) and the smaller copy modules. */
export async function siteTextSource(locale: Locale) {
  const settings = await getStoreSettings();
  const dict = applyHomeCopy(getDictionary(locale), parseHomeCopy(settings.homeCopy)[locale]);
  return {
    source: {
      ...dict,
      shopCopy: getShopCopy(locale),
      lookPage: getLookPageCopy(locale),
      showcaseCopy: getShowcaseCopy(locale),
    },
    storeName: settings.storeName,
  };
}

const forRequest = cache(async () => {
  const locale = await getLocale();
  const { source, storeName } = await siteTextSource(locale);
  return { locale, text: dictionaryText(source, storeName) };
});

/** The design in the visitor's language. */
export async function localizeForRequest(doc: BuilderDoc): Promise<BuilderDoc> {
  if (!docNeedsLocalizing(doc)) return doc;
  const { locale, text } = await forRequest();
  return localizeDoc(doc, locale, text);
}

/** Every site text in one language, for the editor's preview. */
export async function flatSiteText(locale: Locale): Promise<Record<string, string>> {
  const { source, storeName } = await siteTextSource(locale);
  return flattenDictionary(source, storeName);
}

/** Story rows that link to a product but have no price typed in. */
export function storyPriceSlugs(doc: BuilderDoc): string[] {
  const slugs = new Set<string>();
  for (const block of doc.cells.flat()) {
    if (block.type !== "story" || block.cardPrice || !block.cardTitle) continue;
    const slug = (block.cardHref ?? block.href ?? "").match(/^\/products\/([\w-]+)\/?$/)?.[1];
    if (slug) slugs.add(slug);
  }
  return [...slugs];
}

/** Fills those prices from the linked products, so they follow the catalogue. */
export async function withStoryPrices(doc: BuilderDoc): Promise<BuilderDoc> {
  const slugs = storyPriceSlugs(doc);
  if (slugs.length === 0) return doc;
  try {
    const [{ db }, settings] = await Promise.all([import("@/lib/db"), getStoreSettings()]);
    const products = await db.product.findMany({
      where: { slug: { in: slugs }, active: true },
      select: { slug: true, price: true, currency: true },
    });
    const bySlug = new Map(products.map((p) => [p.slug, p]));
    const money = (cents: number, currency: string) =>
      new Intl.NumberFormat(settings.defaultLocale, { style: "currency", currency }).format(cents / 100);
    return {
      ...doc,
      cells: doc.cells.map((cell) =>
        cell.map((block) => {
          if (block.type !== "story" || block.cardPrice || !block.cardTitle) return block;
          const slug = (block.cardHref ?? block.href ?? "").match(/^\/products\/([\w-]+)\/?$/)?.[1];
          const product = slug ? bySlug.get(slug) : undefined;
          if (!product) return block;
          return { ...block, cardPrice: money(product.price, product.currency) };
        })
      ),
    };
  } catch {
    // The design still renders without prices if the catalogue is unavailable.
    return doc;
  }
}
