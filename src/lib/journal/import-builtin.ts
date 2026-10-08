import type { Article, Block, JournalImage } from "@/lib/journal/types";
import type { StoredBlock, StoredSource } from "@/lib/journal/article-schema";

/**
 * Turns a built-in (in-code) article into the shape Admin > Articles stores,
 * so it can be edited there. Catalog-piece images become plain photo URLs
 * (looked up in `productImages` by slug); series navigation and related-article
 * links are not part of the editable format and are dropped.
 */
export function articleToPostData(article: Article, productImages: Map<string, string>) {
  const imageUrl = (image: JournalImage) =>
    image.kind === "file" ? image.src : (productImages.get(image.productSlug) ?? "");

  const convert = (blocks: Block[]): StoredBlock[] =>
    blocks.flatMap((block): StoredBlock[] => {
      if (block.type !== "image") return [block as StoredBlock];
      const src = imageUrl(block.image);
      return src
        ? [{ type: "image", src, alt: block.image.alt, caption: block.image.caption }]
        : [];
    });

  const it = article.translations?.it;
  const sources: StoredSource[] = article.sources.map((s) => ({
    title: s.title,
    publisher: s.publisher,
    url: s.url,
    usedFor: s.usedFor,
    usedForIt: s.usedForIt,
    accessed: s.accessed,
    kind: s.kind,
  }));

  return {
    slug: article.slug,
    title: article.title,
    seoTitle: article.seoTitle,
    description: article.description,
    category: article.category,
    intro: article.intro,
    heroUrl: imageUrl(article.hero) || "/logo.png",
    heroAlt: article.hero.alt,
    body: convert(article.body),
    sources,
    translationIt: it
      ? {
          title: it.title,
          seoTitle: it.seoTitle,
          description: it.description,
          intro: it.intro,
          heroAlt: article.hero.altIt,
          body: convert(it.body),
        }
      : null,
    publishedAt: new Date(`${article.published}T12:00:00Z`),
  };
}
