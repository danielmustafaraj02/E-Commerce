import { cache } from "react";
import { z } from "zod";
import type { JournalPost, Product } from "@prisma/client";
import { db } from "@/lib/db";
import { ARTICLES } from "@/lib/journal";
import type { Article, Block, JournalCategory } from "@/lib/journal/types";

/**
 * Articles written in Admin > Articles. They are converted to the same
 * `Article` shape as the in-code ones (src/content/journal), so the blog index,
 * article page, home preview and sitemap render both kinds identically.
 * Only published posts ever leave this module.
 */

export const JOURNAL_CATEGORIES = ["history", "craft", "buying", "care", "gifting"] as const;

/** Links allowed in text and buttons: site paths or http(s) only, never
 *  javascript:/data: — article text is rendered as links. */
const safeHref = (href: string) => /^(\/(?!\/)|https?:\/\/)/.test(href);

const noUnsafeLinks = (text: string) =>
  [...text.matchAll(/\]\(([^)\s]*)\)/g)].every((m) => safeHref(m[1]));

const text = (max: number) =>
  z.string().trim().min(1).max(max).refine(noUnsafeLinks, "Links must start with / or https://");

const imageSrc = z
  .string()
  .trim()
  .max(2000)
  .refine((src) => /^(\/(?!\/)|https:\/\/)/.test(src), "Image must be a /path or https:// URL");

const ownRights = { credit: "", license: "own-photography" as const };

export const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("p"), text: text(4000) }),
  z.object({ type: z.literal("h2"), text: text(200) }),
  z.object({ type: z.literal("h3"), text: text(200) }),
  z.object({
    type: z.literal("quote"),
    text: text(1000),
    cite: z.string().trim().max(200).optional(),
  }),
  z.object({
    type: z.literal("facts"),
    title: text(120),
    items: z.array(text(300)).min(1).max(12),
  }),
  z.object({
    type: z.literal("image"),
    src: imageSrc,
    alt: z.string().trim().max(300).default(""),
    caption: z.string().trim().max(300).optional(),
  }),
  z.object({
    type: z.literal("products"),
    title: text(120),
    slugs: z.array(z.string().trim().min(1).max(200)).min(1).max(8),
  }),
  z.object({
    type: z.literal("cta"),
    text: text(80),
    href: z.string().trim().max(500).refine(safeHref, "Link must start with / or https://"),
  }),
]);

/** What the admin editor stores. Images are flat here and become JournalImage
 *  blocks only in toArticle. */
export type StoredBlock = z.infer<typeof blockSchema>;
export const bodySchema = z.array(blockSchema).max(80);

/** Tolerant read of the JSON column: invalid blocks are dropped, not thrown. */
export function parseBody(value: unknown): StoredBlock[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const parsed = blockSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

/** A citation. Mirrors Source (types.ts); the url is shown as a link, so only
 *  http(s) is accepted. */
export const sourceSchema = z.object({
  title: z.string().trim().min(1, "Each source needs a title").max(200),
  publisher: z.string().trim().max(200).default(""),
  url: z
    .string()
    .trim()
    .max(1000)
    .refine((u) => /^https?:\/\//.test(u), "Source links must start with https://"),
  usedFor: z.string().trim().max(500).default(""),
  usedForIt: z.string().trim().max(500).optional(),
  accessed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date like 2026-10-04"),
  kind: z.enum(["primary", "scholarly", "institutional", "reference"]).optional(),
});
export const sourcesSchema = z.array(sourceSchema).max(30);
export type StoredSource = z.infer<typeof sourceSchema>;

export function parseSources(value: unknown): StoredSource[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const parsed = sourceSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

/** The Italian version of an article. Title, description and intro are
 *  required for it to count as a translation. */
export const translationItSchema = z.object({
  title: z.string().trim().min(3).max(150),
  seoTitle: z.string().trim().max(70).optional(),
  description: z.string().trim().min(10).max(300),
  intro: z.string().trim().min(10).max(2000),
  heroAlt: z.string().trim().max(300).optional(),
  body: bodySchema,
});
export type StoredTranslationIt = z.infer<typeof translationItSchema>;

export function parseTranslationIt(value: unknown): StoredTranslationIt | null {
  const parsed = translationItSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

type PostWithProducts = JournalPost & { products: Pick<Product, "slug">[] };

function mapBody(stored: StoredBlock[], productSlugs: string[], featuredTitle: string): Block[] {
  const body: Block[] = stored.map((block): Block => {
    if (block.type === "image") {
      return {
        type: "image",
        image: { kind: "file", src: block.src, alt: block.alt, caption: block.caption, rights: ownRights },
      };
    }
    return block;
  });
  if (productSlugs.length > 0) body.push({ type: "products", title: featuredTitle, slugs: productSlugs });
  return body;
}

export function toArticle(post: PostWithProducts): Article {
  const slugs = post.products.map((p) => p.slug);
  const date = (post.publishedAt ?? post.createdAt).toISOString().slice(0, 10);
  const updated = post.updatedAt.toISOString().slice(0, 10);
  const it = parseTranslationIt(post.translationIt);
  return {
    slug: post.slug,
    title: post.title,
    seoTitle: post.seoTitle || post.title,
    description: post.description,
    category: (JOURNAL_CATEGORIES as readonly string[]).includes(post.category)
      ? (post.category as JournalCategory)
      : "history",
    primaryKeyword: post.title.toLowerCase(),
    secondaryKeywords: [],
    intro: post.intro,
    body: mapBody(parseBody(post.body), slugs, "Featured pieces"),
    published: date,
    updated: updated > date ? updated : undefined,
    hero: {
      kind: "file",
      src: post.heroUrl,
      alt: post.heroAlt,
      altIt: it?.heroAlt || undefined,
      rights: ownRights,
    },
    sources: parseSources(post.sources).map((source) => ({ ...source })),
    related: [],
    translations: it
      ? {
          it: {
            title: it.title,
            seoTitle: it.seoTitle || it.title,
            description: it.description,
            primaryKeyword: it.title.toLowerCase(),
            secondaryKeywords: [],
            intro: it.intro,
            body: mapBody(it.body, slugs, "Pezzi in evidenza"),
          },
        }
      : undefined,
  };
}

const include = { products: { select: { slug: true } } } as const;

export const getDbArticles = cache(async (): Promise<Article[]> => {
  try {
    const posts = await db.journalPost.findMany({
      where: { published: true },
      include,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    });
    return posts.map(toArticle);
  } catch (error) {
    // The blog must still render (static articles) if the table is unavailable.
    console.error("Journal posts unavailable", error instanceof Error ? error.message : error);
    return [];
  }
});

/** Every published article, newest first: written-in-admin and in-code. */
export const getAllArticles = cache(async (): Promise<Article[]> => {
  const dbArticles = await getDbArticles();
  if (dbArticles.length === 0) return ARTICLES;
  return [...dbArticles, ...ARTICLES].sort((a, b) => b.published.localeCompare(a.published));
});

export async function findArticle(slug: string): Promise<Article | null> {
  const staticArticle = ARTICLES.find((a) => a.slug === slug);
  if (staticArticle) return staticArticle;
  return (await getDbArticles()).find((a) => a.slug === slug) ?? null;
}

/** Articles that feature a product, for its product page: ones linked in the
 *  admin plus in-code ones that show it. */
export const getArticlesForProduct = cache(async (product: { id: string; slug: string }) => {
  const [linked, all] = await Promise.all([
    db.journalPost
      .findMany({
        where: { published: true, products: { some: { id: product.id } } },
        include,
        orderBy: { publishedAt: "desc" },
      })
      .then((posts) => posts.map(toArticle))
      .catch(() => [] as Article[]),
    Promise.resolve(ARTICLES),
  ]);
  const featuring = all.filter((article) => {
    const slugs = new Set<string>();
    if (article.hero.kind === "product") slugs.add(article.hero.productSlug);
    for (const block of article.body) {
      if (block.type === "products") block.slugs.forEach((s) => slugs.add(s));
      if (block.type === "image" && block.image.kind === "product")
        slugs.add(block.image.productSlug);
    }
    return slugs.has(product.slug);
  });
  const seen = new Set<string>();
  return [...linked, ...featuring].filter((a) => !seen.has(a.slug) && seen.add(a.slug));
});
