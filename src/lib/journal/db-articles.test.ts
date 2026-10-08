import { describe, expect, it } from "vitest";
import { bodySchema, parseBody, slugify } from "./db-articles";

describe("bodySchema", () => {
  it("accepts normal blocks", () => {
    expect(
      bodySchema.safeParse([
        { type: "h2", text: "Care" },
        { type: "p", text: "See [our guide](/blog/x) or [Wikipedia](https://en.wikipedia.org)." },
        { type: "cta", text: "Shop", href: "/products" },
      ]).success
    ).toBe(true);
  });
  it("rejects javascript: links in text and buttons", () => {
    expect(bodySchema.safeParse([{ type: "p", text: "[x](javascript:alert(1))" }]).success).toBe(
      false
    );
    expect(
      bodySchema.safeParse([{ type: "cta", text: "Go", href: "javascript:alert(1)" }]).success
    ).toBe(false);
    expect(bodySchema.safeParse([{ type: "cta", text: "Go", href: "//evil.com" }]).success).toBe(
      false
    );
  });
  it("rejects non-https image sources", () => {
    expect(
      bodySchema.safeParse([{ type: "image", src: "data:image/png;base64,AAA", alt: "" }]).success
    ).toBe(false);
  });
});

describe("parseBody", () => {
  it("drops invalid blocks instead of throwing", () => {
    expect(parseBody([{ type: "p", text: "ok" }, { type: "nope" }, 3])).toEqual([
      { type: "p", text: "ok" },
    ]);
    expect(parseBody(null)).toEqual([]);
  });
});

describe("slugify", () => {
  it("makes url-safe slugs", () => {
    expect(slugify("  Come curare il vetro di Murano! ")).toBe("come-curare-il-vetro-di-murano");
    expect(slugify("Café à Venise")).toBe("cafe-a-venise");
  });
});

import { toArticle } from "./db-articles";

describe("toArticle", () => {
  const post = {
    id: "1",
    slug: "my-post",
    title: "My post",
    seoTitle: null,
    description: "A description here",
    category: "care",
    intro: "Intro text here",
    heroUrl: "https://x.public.blob.vercel-storage.com/a.jpg",
    heroAlt: "alt",
    body: [
      { type: "p", text: "Hello" },
      { type: "image", src: "/a.jpg", alt: "a" },
      { type: "bogus" },
    ],
    published: true,
    publishedAt: new Date("2026-10-04T10:00:00Z"),
    createdAt: new Date("2026-10-03T10:00:00Z"),
    updatedAt: new Date("2026-10-04T10:00:00Z"),
    sources: [
      {
        title: "CCI",
        publisher: "Canada",
        url: "https://example.org/a",
        usedFor: "Care",
        accessed: "2026-10-01",
      },
      { title: "bad", url: "javascript:alert(1)", accessed: "2026-10-01" },
    ],
    translationIt: {
      title: "Il mio articolo",
      description: "Una descrizione",
      intro: "Introduzione qui",
      heroAlt: "alt it",
      body: [{ type: "p", text: "Ciao" }],
    },
    products: [{ slug: "ring-1" }],
  };
  it("maps to the shared Article shape and appends linked products", () => {
    const a = toArticle(post);
    expect(a.slug).toBe("my-post");
    expect(a.seoTitle).toBe("My post");
    expect(a.published).toBe("2026-10-04");
    expect(a.hero).toMatchObject({ kind: "file", src: post.heroUrl });
    expect(a.body.map((b) => b.type)).toEqual(["p", "image", "products"]);
    expect(a.body[2]).toMatchObject({ type: "products", slugs: ["ring-1"] });
    expect(a.sources).toHaveLength(1);
    expect(a.sources[0].url).toBe("https://example.org/a");
  });
  it("builds the Italian version, with linked products in Italian", () => {
    const a = toArticle(post);
    expect(a.translations?.it?.title).toBe("Il mio articolo");
    expect(a.translations?.it?.body.map((b) => b.type)).toEqual(["p", "products"]);
    expect(a.hero.altIt).toBe("alt it");
  });
  it("has no translation when the Italian copy is incomplete", () => {
    expect(toArticle({ ...post, translationIt: { title: "x" } }).translations).toBeUndefined();
    expect(toArticle({ ...post, translationIt: null }).translations).toBeUndefined();
  });
  it("adds other languages from translation rows", () => {
    const a = toArticle({
      ...post,
      translationRows: [
        {
          locale: "fr",
          title: "Mon article",
          seoTitle: null,
          description: "Une description assez longue",
          intro: "Une introduction assez longue",
          heroAlt: null,
          body: [{ type: "p", text: "Bonjour" }],
        },
        { locale: "xx", title: "x", seoTitle: null, description: "x", intro: "x", heroAlt: null, body: [] },
      ],
    });
    expect(a.translations?.fr?.title).toBe("Mon article");
    expect(a.translations?.fr?.body.map((b) => b.type)).toEqual(["p", "products"]);
    expect(Object.keys(a.translations ?? {}).sort()).toEqual(["fr", "it"]);
  });
  it("falls back to a valid category", () => {
    expect(toArticle({ ...post, category: "weird" }).category).toBe("history");
  });
});

describe("video and list blocks", () => {
  it("embeds only YouTube and Vimeo links", async () => {
    const { videoEmbedUrl } = await import("./article-schema");
    expect(videoEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
    );
    expect(videoEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
    );
    expect(videoEmbedUrl("https://vimeo.com/123456789")).toBe(
      "https://player.vimeo.com/video/123456789"
    );
    expect(videoEmbedUrl("https://evil.example/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(videoEmbedUrl("javascript:alert(1)")).toBeNull();
  });
  it("validates the new blocks", () => {
    expect(
      bodySchema.safeParse([
        { type: "list", items: ["one", "two"], ordered: true },
        { type: "video", url: "https://youtu.be/dQw4w9WgXcQ" },
      ]).success
    ).toBe(true);
    expect(bodySchema.safeParse([{ type: "video", url: "https://example.com/x" }]).success).toBe(
      false
    );
  });
});
