import type { Article, ArticleCopy, Block, JournalContentLocale, LocalizedArticle } from "./types";
import { historyOfMuranoGlass } from "@/content/journal/history-of-murano-glass";
import { muranoGlassMaterials } from "@/content/journal/murano-glass-materials-cristallo-lattimo";
import { muranoGlassTechniques } from "@/content/journal/murano-glassmaking-techniques-filigrana-murrine";
import { muranoGlassmakersAndLabor } from "@/content/journal/murano-glassmakers-guilds-labor";
import { venetianGlassBeads } from "@/content/journal/venetian-glass-beads";
import { muranoGlassModernRevival } from "@/content/journal/murano-glass-modern-revival-design";
import { howToRecognizeAuthenticMuranoGlass } from "@/content/journal/how-to-recognize-authentic-murano-glass";
import { howToCareForMuranoGlassJewelry } from "@/content/journal/how-to-care-for-murano-glass-jewelry";
import { thingsToDoInMurano } from "@/content/journal/things-to-do-in-murano";

// Newest first. Keep a dated series together in reading order, even when its
// opening article is older and has only just been updated as part of the series.
const journalArticles: Article[] = [
  historyOfMuranoGlass,
  muranoGlassMaterials,
  muranoGlassTechniques,
  muranoGlassmakersAndLabor,
  venetianGlassBeads,
  muranoGlassModernRevival,
  thingsToDoInMurano,
  howToRecognizeAuthenticMuranoGlass,
  howToCareForMuranoGlassJewelry,
];

const latestSeriesDate = journalArticles
  .filter((article) => article.series)
  .reduce((latest, article) => {
    const date = article.updated ?? article.published;
    return date > latest ? date : latest;
  }, "0000-00-00");

export const ARTICLES = journalArticles.sort((a, b) => {
  const aDate = a.series ? latestSeriesDate : a.published;
  const bDate = b.series ? latestSeriesDate : b.published;
  const byDate = bDate.localeCompare(aDate);
  if (byDate !== 0) return byDate;
  if (a.series && b.series && a.series.key === b.series.key) {
    return a.series.episode - b.series.episode;
  }
  return 0;
});

// The cluster's pillar: every other article links back to it.
export const PILLAR_SLUG = "history-of-murano-glass";

export function getArticle(slug: string) {
  return ARTICLES.find((a) => a.slug === slug) ?? null;
}

// English remains the source copy. Individual articles may add an Italian
// translation; other localized routes use the English copy until translated.
export const ARTICLE_LOCALE = "en" as const;
export function articlePath(slug: string, locale: JournalContentLocale = ARTICLE_LOCALE) {
  return `/${locale}/blog/${slug}`;
}

export function articleLanguages(article: Article) {
  const languages: Record<string, string> = {
    en: articlePath(article.slug, "en"),
  };
  if (article.translations?.it) languages.it = articlePath(article.slug, "it");
  languages["x-default"] = languages.en;
  return languages;
}

export function localizeArticle(article: Article, requestedLocale: string): LocalizedArticle {
  const { translations = {}, ...shared } = article;
  const translation = requestedLocale === "it" ? translations.it : undefined;
  return {
    ...shared,
    ...(translation ?? {}),
    contentLocale: translation ? "it" : "en",
  };
}

export function relatedArticles(article: Article | LocalizedArticle, locale: string) {
  return article.related
    .map(getArticle)
    .filter((related): related is Article => related !== null)
    .map((related) => localizeArticle(related, locale));
}

export function seriesArticles(article: Article | LocalizedArticle, locale: string) {
  if (!article.series) return [];
  return ARTICLES.filter((candidate) => candidate.series?.key === article.series?.key)
    .sort((a, b) => (a.series?.episode ?? 0) - (b.series?.episode ?? 0))
    .map((candidate) => localizeArticle(candidate, locale));
}

function blockText(block: Block): string {
  switch (block.type) {
    case "p":
    case "h2":
    case "h3":
    case "quote":
    case "cta":
      return block.text;
    case "facts":
      return [block.title, ...block.items].join(" ");
    default:
      return "";
  }
}

export function readingMinutes(article: Pick<ArticleCopy, "intro" | "body">) {
  const text = [article.intro, ...article.body.map(blockText)].join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export type InlinePart = { text: string } | { text: string; href: string };

// Paragraph text with [label](href) links.
export function parseInline(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index) });
    parts.push({ text: match[1], href: match[2] });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

export function inlineLinks(article: ArticleCopy) {
  return [article.intro, ...article.body.map(blockText)].flatMap((text) =>
    parseInline(text).flatMap((part) => ("href" in part ? [part.href] : []))
  );
}

// Every product slug an article shows (cards, images, hero).
export function articleProductSlugs(article: Article) {
  const slugs = new Set<string>();
  const add = (image: Article["hero"]) => {
    if (image.kind === "product") slugs.add(image.productSlug);
  };
  add(article.hero);
  const addBody = (body: Block[]) => {
    for (const block of body) {
      if (block.type === "products") block.slugs.forEach((s) => slugs.add(s));
      if (block.type === "image") add(block.image);
    }
  };
  addBody(article.body);
  if (article.translations?.it) addBody(article.translations.it.body);
  return [...slugs];
}
