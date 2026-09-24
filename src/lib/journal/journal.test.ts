import { describe, expect, it } from "vitest";
import {
  ARTICLES,
  PILLAR_SLUG,
  articleProductSlugs,
  getArticle,
  inlineLinks,
  parseInline,
  readingMinutes,
} from "./index";
import type { JournalImage } from "./types";

// Editorial rules for every article (see the journal brief): sourced, licensed,
// linked into the cluster, with sensible SEO metadata.
const CATEGORY_SLUGS = [
  "bracciali-in-vetro-di-murano",
  "collane-in-vetro-di-murano",
  "orecchini-in-vetro-di-murano",
];
const STATIC_ROUTES = ["/products", "/murano-glass", "/about", "/contact", "/blog"];

function isKnownInternal(href: string) {
  if (STATIC_ROUTES.includes(href)) return true;
  const [, section, slug] = href.split("/");
  if (section === "blog") return getArticle(slug) !== null;
  if (section === "category") return CATEGORY_SLUGS.includes(slug);
  if (section === "products") return /^[a-z0-9-]+$/.test(slug ?? "");
  return false;
}

function images(article: (typeof ARTICLES)[number]): JournalImage[] {
  return [article.hero, ...article.body.flatMap((b) => (b.type === "image" ? [b.image] : []))];
}

describe("journal articles", () => {
  it("have unique, readable slugs", () => {
    const slugs = ARTICLES.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  for (const article of ARTICLES) {
    describe(article.slug, () => {
      it("has search metadata of a sensible length", () => {
        expect(article.seoTitle.length).toBeLessThanOrEqual(62);
        expect(article.description.length).toBeGreaterThanOrEqual(110);
        expect(article.description.length).toBeLessThanOrEqual(165);
        expect(article.secondaryKeywords.length).toBeGreaterThanOrEqual(3);
      });

      it("cites at least three sources, each with what it was used for", () => {
        expect(article.sources.length).toBeGreaterThanOrEqual(3);
        for (const source of article.sources) {
          expect(source.url).toMatch(/^https:\/\//);
          expect(source.usedFor.length).toBeGreaterThan(10);
          expect(source.accessed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
      });

      it("documents the rights to every image", () => {
        for (const image of images(article)) {
          expect(image.alt.length).toBeGreaterThan(5);
          if (image.rights.license !== "own-photography") {
            expect(image.rights.sourceUrl).toMatch(/^https:\/\//);
          }
          if (image.rights.license === "cc-by" || image.rights.license === "cc-by-sa") {
            expect(image.rights.attribution).toBeTruthy();
          }
        }
      });

      it("links only to pages that exist, and into the cluster", () => {
        const internal = inlineLinks(article).filter((href) => href.startsWith("/"));
        for (const href of internal) expect(isKnownInternal(href), href).toBe(true);
        if (article.slug !== PILLAR_SLUG) expect(internal).toContain(`/blog/${PILLAR_SLUG}`);
        for (const href of inlineLinks(article).filter((h) => !h.startsWith("/"))) {
          expect(href).toMatch(/^https:\/\//);
        }
      });

      it("relates to other existing articles and shows products", () => {
        expect(article.related.length).toBeGreaterThanOrEqual(2);
        for (const slug of article.related) {
          expect(slug).not.toBe(article.slug);
          expect(getArticle(slug)).not.toBeNull();
        }
        expect(articleProductSlugs(article).length).toBeGreaterThanOrEqual(2);
      });
    });
  }
});

describe("parseInline", () => {
  it("splits text and [label](href) links", () => {
    expect(parseInline("See [the guide](/murano-glass) today.")).toEqual([
      { text: "See " },
      { text: "the guide", href: "/murano-glass" },
      { text: " today." },
    ]);
  });
});

describe("readingMinutes", () => {
  it("is at least one minute", () => {
    for (const article of ARTICLES) expect(readingMinutes(article)).toBeGreaterThanOrEqual(1);
  });
});
