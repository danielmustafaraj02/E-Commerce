import type { Article, Block } from "./types";
import { historyOfMuranoGlass } from "@/content/journal/history-of-murano-glass";
import { venetianGlassBeads } from "@/content/journal/venetian-glass-beads";
import { howToRecognizeAuthenticMuranoGlass } from "@/content/journal/how-to-recognize-authentic-murano-glass";
import { howToCareForMuranoGlassJewelry } from "@/content/journal/how-to-care-for-murano-glass-jewelry";

// Newest first. Add new articles here (and they're checked by journal.test.ts).
export const ARTICLES: Article[] = [
  historyOfMuranoGlass,
  venetianGlassBeads,
  howToRecognizeAuthenticMuranoGlass,
  howToCareForMuranoGlassJewelry,
].sort((a, b) => b.published.localeCompare(a.published));

// The cluster's pillar: every other article links back to it.
export const PILLAR_SLUG = "history-of-murano-glass";

export function getArticle(slug: string) {
  return ARTICLES.find((a) => a.slug === slug) ?? null;
}

// Articles are written in English only: /it/blog/x, /fr/blog/x… carry the
// same English text inside translated menus. So every copy names the English
// URL as its canonical and English is the article's only language version,
// rather than 11 URLs each claiming to be a translation (duplicate content).
// The article page's metadata and the sitemap both use this.
export const ARTICLE_LOCALE = "en" as const;
export function articlePath(slug: string) {
  return `/${ARTICLE_LOCALE}/blog/${slug}`;
}

export function relatedArticles(article: Article) {
  return article.related.map(getArticle).filter((a): a is Article => a !== null);
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

export function readingMinutes(article: Article) {
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

export function inlineLinks(article: Article) {
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
  for (const block of article.body) {
    if (block.type === "products") block.slugs.forEach((s) => slugs.add(s));
    if (block.type === "image") add(block.image);
  }
  return [...slugs];
}
