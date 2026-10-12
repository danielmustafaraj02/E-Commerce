import { describe, expect, it } from "vitest";
import { imageConfigDefault } from "next/dist/shared/lib/image-config";
import {
  IMAGE_WIDTHS,
  canOptimize,
  optimizedImageUrl,
  optimizedSrcSet,
  shareImageUrl,
} from "./optimized-image";

const BLOB = "https://abc.public.blob.vercel-storage.com/products/ring-x1.webp";

describe("optimizer widths", () => {
  it("match the sizes Next's optimizer accepts (next.config.ts keeps the defaults)", () => {
    expect([...IMAGE_WIDTHS]).toEqual(
      [...imageConfigDefault.imageSizes, ...imageConfigDefault.deviceSizes].sort((a, b) => a - b)
    );
  });
});

describe("canOptimize", () => {
  it("takes site files and allowlisted hosts", () => {
    expect(canOptimize("/products/a.webp")).toBe(true);
    expect(canOptimize(BLOB)).toBe(true);
  });

  it("refuses SVGs, local query strings and other hosts", () => {
    expect(canOptimize("/decor/leaf.svg")).toBe(false);
    expect(canOptimize("/products/a.webp?v=2")).toBe(false);
    expect(canOptimize("https://cdn.example/a.jpg")).toBe(false);
  });
});

describe("optimizedImageUrl", () => {
  it("asks for the next width the optimizer offers, using the current file name", () => {
    expect(optimizedImageUrl("/products/a b.png", 1000)).toBe(
      "/_next/image?url=%2Fproducts%2Fa%20b.webp&w=1080&q=75"
    );
    expect(optimizedImageUrl("/hero/x.webp", 1920, 90)).toBe(
      "/_next/image?url=%2Fhero%2Fx.webp&w=1920&q=90"
    );
    expect(optimizedImageUrl("/hero/x.webp", 9999)).toContain("&w=3840&");
  });

  it("returns what the optimizer can't take unchanged", () => {
    expect(optimizedImageUrl("/decor/leaf.svg", 640)).toBe("/decor/leaf.svg");
    expect(optimizedImageUrl("https://cdn.example/a.jpg", 640)).toBe("https://cdn.example/a.jpg");
  });
});

describe("optimizedSrcSet", () => {
  it("lists optimized widths with descriptors", () => {
    const set = optimizedSrcSet("/products/a.png")!;
    expect(set.split(", ")).toHaveLength(7);
    expect(set).toMatch(/^\/_next\/image\?url=%2Fproducts%2Fa\.webp&w=640&q=75 640w, /);
    expect(set).toMatch(/&w=2048&q=75 2048w$/);
  });

  it("is undefined when the optimizer can't take the picture", () => {
    expect(optimizedSrcSet("https://cdn.example/a.jpg")).toBeUndefined();
  });
});

describe("shareImageUrl", () => {
  it("sends this site's pictures through the optimizer at 1200px", () => {
    expect(shareImageUrl("/og-image.png")).toBe("/_next/image?url=%2Fog-image.png&w=1200&q=75");
  });

  it("leaves pictures on other hosts as they are", () => {
    expect(shareImageUrl(BLOB)).toBe(BLOB);
    expect(shareImageUrl("https://cdn.example/a.jpg")).toBe("https://cdn.example/a.jpg");
  });
});
