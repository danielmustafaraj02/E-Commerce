import { cache } from "react";
import type { JournalPost, JournalPostTranslation, Product } from "@prisma/client";
import { db } from "@/lib/db";
import { ARTICLES } from "@/lib/journal";
import { locales, type Locale } from "@/lib/i18n/locale-constants";
import type { Article, Block, JournalCategory } from "@/lib/journal/types";
import {
  JOURNAL_CATEGORIES,
  parseBody,
  parseSources,
  parseTranslationIt,
  type StoredBlock,
  type StoredTranslationIt,
} from "@/lib/journal/article-schema";

/**
 * Articles written in Admin > Articles. They are converted to the same
 * `Article` shape as the in-code ones (src/content/journal), so the blog index,
 * article page, home preview and sitemap render both kinds identically.
 * Only published posts ever leave this module.
 */

export * from "@/lib/journal/article-schema";

const ownRights = { credit: "", license: "own-photography" as const };

type PostWithProducts = JournalPost & {
  products: Pick<Product, "slug">[];
  /** Copy in languages other than English and Italian, from JournalPostTranslation. */
  translationRows?: Pick<
    JournalPostTranslation,
    "locale" | "title" | "seoTitle" | "description" | "intro" | "heroAlt" | "body"
  >[];
};

// "Featured pieces" heading appended after a translated article's text.
const FEATURED_TITLE: Partial<Record<Locale, string>> = {
  it: "Pezzi in evidenza",
  fr: "Pièces à l'honneur",
  de: "Ausgewählte Stücke",
  es: "Piezas destacadas",
  pt: "Peças em destaque",
};

function mapBody(stored: StoredBlock[], productSlugs: string[], featuredTitle: string): Block[] {
  const body: Block[] = stored.map((block): Block => {
    if (block.type === "image") {
      return {
        type: "image",
        image: {
          kind: "file",
          src: block.src,
          alt: block.alt,
          caption: block.caption,
          rights: ownRights,
        },
      };
    }
    return block;
  });
  if (productSlugs.length > 0)
    body.push({ type: "products", title: featuredTitle, slugs: productSlugs });
  return body;
}

export function toArticle(post: PostWithProducts): Article {
  const slugs = post.products.map((p) => p.slug);
  const date = (post.publishedAt ?? post.createdAt).toISOString().slice(0, 10);
  const updated = post.updatedAt.toISOString().slice(0, 10);
  const it = parseTranslationIt(post.translationIt);
  const translations: Article["translations"] = {};
  const add = (locale: Locale, copy: StoredTranslationIt) => {
    translations[locale as Exclude<Locale, "en">] = {
      title: copy.title,
      seoTitle: copy.seoTitle || copy.title,
      description: copy.description,
      primaryKeyword: copy.title.toLowerCase(),
      secondaryKeywords: [],
      intro: copy.intro,
      body: mapBody(copy.body, slugs, FEATURED_TITLE[locale] ?? "Featured pieces"),
    };
  };
  if (it) add("it", it);
  for (const row of post.translationRows ?? []) {
    const copy = parseTranslationIt({
      ...row,
      seoTitle: row.seoTitle ?? undefined,
      heroAlt: row.heroAlt ?? undefined,
    });
    if (copy && (locales as readonly string[]).includes(row.locale) && row.locale !== "en") {
      add(row.locale as Locale, copy);
    }
  }
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
    translations: Object.keys(translations).length > 0 ? translations : undefined,
  };
}

/** Posts as Articles, with their extra-language copy. The translation table is
 *  read separately so a database without it yet still serves the posts. */
async function toArticles(posts: (JournalPost & { products: Pick<Product, "slug">[] })[]) {
  let rows: JournalPostTranslation[] = [];
  if (posts.length > 0) {
    try {
      rows = await db.journalPostTranslation.findMany({
        where: { postId: { in: posts.map((p) => p.id) } },
      });
    } catch (error) {
      console.error(
        "Journal translations unavailable",
        error instanceof Error ? error.message : error
      );
    }
  }
  return posts.map((post) =>
    toArticle({ ...post, translationRows: rows.filter((row) => row.postId === post.id) })
  );
}

const include = { products: { select: { slug: true } } } as const;

export const getDbArticles = cache(async (): Promise<Article[]> => {
  try {
    const posts = await db.journalPost.findMany({
      where: { published: true },
      include,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    });
    return await toArticles(posts);
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
  // A published admin copy replaces the built-in article with the same slug.
  const overridden = new Set(dbArticles.map((a) => a.slug));
  const builtIn = ARTICLES.filter((a) => !overridden.has(a.slug));
  return [...dbArticles, ...builtIn].sort((a, b) => b.published.localeCompare(a.published));
});

export async function findArticle(slug: string): Promise<Article | null> {
  const edited = (await getDbArticles()).find((a) => a.slug === slug);
  return edited ?? ARTICLES.find((a) => a.slug === slug) ?? null;
}

/** Articles that feature a product, for its product page: ones linked in the
 *  admin plus in-code ones that show it. */
export const getArticlesForProduct = cache(async (product: { id: string; slug: string }) => {
  const [linked, all, edited] = await Promise.all([
    db.journalPost
      .findMany({
        where: { published: true, products: { some: { id: product.id } } },
        include,
        orderBy: { publishedAt: "desc" },
      })
      .then(toArticles)
      .catch(() => [] as Article[]),
    Promise.resolve(ARTICLES),
    getDbArticles(),
  ]);
  const editedBySlug = new Map(edited.map((a) => [a.slug, a]));
  const featuring = all
    .filter((article) => {
      const slugs = new Set<string>();
      if (article.hero.kind === "product") slugs.add(article.hero.productSlug);
      for (const block of article.body) {
        if (block.type === "products") block.slugs.forEach((s) => slugs.add(s));
        if (block.type === "image" && block.image.kind === "product")
          slugs.add(block.image.productSlug);
      }
      return slugs.has(product.slug);
    })
    .map((article) => editedBySlug.get(article.slug) ?? article);
  const seen = new Set<string>();
  return [...linked, ...featuring].filter((a) => !seen.has(a.slug) && seen.add(a.slug));
});
