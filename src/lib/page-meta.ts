import { cache } from "react";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getLocale } from "@/lib/i18n/locale";

/**
 * Search-engine title / description / share image overrides, edited in
 * Admin > Overview > Page metadata and on each product, category and look.
 * `key` is a page path ("/about", "/products") or an entity
 * ("product:<slug>", "category:<slug>", "look:<id>", "legal:<slug>").
 * Anything not overridden keeps the page's built-in metadata.
 */

export type PageMetaRow = {
  title: string | null;
  description: string | null;
  ogImageUrl: string | null;
  noindex: boolean;
};

const read = cache(async (key: string, locale: string): Promise<PageMetaRow | null> => {
  try {
    return await db.pageMeta.findUnique({
      where: { key_locale: { key, locale } },
      select: { title: true, description: true, ogImageUrl: true, noindex: true },
    });
  } catch {
    // Table not migrated yet: behave as if nothing is overridden.
    return null;
  }
});

/** Pure merge of an override into a page's metadata (exported for tests). */
export function mergePageMeta(base: Metadata, row: PageMetaRow | null): Metadata {
  if (!row) return base;
  const title = row.title?.trim() || undefined;
  const description = row.description?.trim() || undefined;
  const image = row.ogImageUrl?.trim() || undefined;
  if (!title && !description && !image && !row.noindex) return base;

  const openGraph = { ...base.openGraph } as NonNullable<Metadata["openGraph"]>;
  const twitter = { ...base.twitter } as NonNullable<Metadata["twitter"]>;
  if (title) {
    openGraph.title = title;
    twitter.title = title;
  }
  if (description) {
    openGraph.description = description;
    twitter.description = description;
  }
  if (image) {
    openGraph.images = [{ url: image }];
    twitter.images = [image];
  }
  return {
    ...base,
    ...(title && { title: { absolute: title } }),
    ...(description && { description }),
    openGraph,
    twitter,
    ...(row.noindex && { robots: { index: false, follow: false } }),
  };
}

export async function withPageMeta(key: string, base: Metadata): Promise<Metadata> {
  return mergePageMeta(base, await read(key, await getLocale()));
}
