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
