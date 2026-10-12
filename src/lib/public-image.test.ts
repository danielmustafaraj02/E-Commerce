import { describe, expect, it } from "vitest";
import { getPathMatch } from "next/dist/shared/lib/router/utils/path-match";
import { prepareDestination } from "next/dist/shared/lib/router/utils/prepare-destination";
import { PHOTO_DIRS, legacyPhotoRewrite, publicImageSrc } from "./public-image";
import { PHOTO_DIRS as SCRIPT_PHOTO_DIRS } from "../../scripts/optimize-images.mjs";

describe("publicImageSrc", () => {
  it("names the WebP that replaced a bundled photo", () => {
    expect(publicImageSrc("/products/collane/a.png")).toBe("/products/collane/a.webp");
    expect(publicImageSrc("/products/a.jpeg")).toBe("/products/a.webp");
    expect(publicImageSrc("/blog/IMG_3205.JPG")).toBe("/blog/IMG_3205.webp");
    expect(publicImageSrc("/hero/poster.jpg?v=2")).toBe("/hero/poster.webp?v=2");
    expect(publicImageSrc("/gift-card/card.png")).toBe("/gift-card/card.webp");
  });

  it("leaves everything else alone", () => {
    for (const src of [
      "/products/a.webp",
      "/logo.png",
      "/og-image.png",
      "/hero/film.mp4",
      "/decor/leaf.svg",
      "/api/feeds/x.png",
      "https://x.public.blob.vercel-storage.com/products/a.png",
      "//cdn.example/products/a.png",
    ]) {
      expect(publicImageSrc(src)).toBe(src);
    }
  });

  it("covers the same folders as the conversion script", () => {
    expect([...PHOTO_DIRS]).toEqual(SCRIPT_PHOTO_DIRS);
  });
});

describe("legacyPhotoRewrite", () => {
  // The same matching Next applies to next.config.ts rewrites.
  const match = getPathMatch(legacyPhotoRewrite.source, {
    removeUnnamedParams: true,
    strict: true,
  });
  const rewrite = (path: string) => {
    const params = match(path);
    return params
      ? prepareDestination({
          appendParamsToQuery: false,
          destination: legacyPhotoRewrite.destination,
          params,
          query: {},
        }).newUrl
      : null;
  };

  it("serves an old photo address from its WebP", () => {
    expect(rewrite("/products/collane-in-vetro-di-murano/collana-rubino.png")).toBe(
      "/products/collane-in-vetro-di-murano/collana-rubino.webp"
    );
    expect(rewrite("/blog/IMG_3205.JPG")).toBe("/blog/IMG_3205.webp");
    expect(rewrite("/hero/hero-atelier-poster.jpg")).toBe("/hero/hero-atelier-poster.webp");
  });

  it("never touches pages or other files", () => {
    expect(rewrite("/products/collana-rubino")).toBeNull();
    expect(rewrite("/about")).toBeNull();
    expect(rewrite("/logo.png")).toBeNull();
    expect(rewrite("/products/a.webp")).toBeNull();
    expect(rewrite("/en/products/a.png")).toBeNull();
  });
});
