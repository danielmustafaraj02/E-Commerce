import { describe, expect, it } from "vitest";
import {
  hostMatchesPattern,
  imageHostPatterns,
  imageRemotePatterns,
  isOptimizableSrc,
} from "./image-hosts";

describe("hostMatchesPattern", () => {
  it("matches an exact hostname only", () => {
    expect(hostMatchesPattern("loremflickr.com", "loremflickr.com")).toBe(true);
    expect(hostMatchesPattern("LoremFlickr.com", "loremflickr.com")).toBe(true);
    expect(hostMatchesPattern("evil-loremflickr.com", "loremflickr.com")).toBe(false);
    expect(hostMatchesPattern("loremflickr.com.evil.io", "loremflickr.com")).toBe(false);
    expect(hostMatchesPattern("cdn.loremflickr.com", "loremflickr.com")).toBe(false);
  });

  it("*. matches exactly one subdomain label", () => {
    const pattern = "*.public.blob.vercel-storage.com";
    expect(hostMatchesPattern("abc123.public.blob.vercel-storage.com", pattern)).toBe(true);
    expect(hostMatchesPattern("public.blob.vercel-storage.com", pattern)).toBe(false);
    expect(hostMatchesPattern("a.b.public.blob.vercel-storage.com", pattern)).toBe(false);
    expect(hostMatchesPattern("abc.public.blob.vercel-storage.com.evil.io", pattern)).toBe(false);
  });

  it("**. matches any depth of subdomain", () => {
    expect(hostMatchesPattern("a.b.cdn.example.com", "**.cdn.example.com")).toBe(true);
    expect(hostMatchesPattern("cdn.example.com", "**.cdn.example.com")).toBe(false);
    expect(hostMatchesPattern("evilcdn.example.com", "**.cdn.example.com")).toBe(false);
  });
});

describe("isOptimizableSrc", () => {
  const patterns = ["images.example.com", "*.blob.example.net"];

  it("always optimizes same-origin paths", () => {
    expect(isOptimizableSrc("/products/x.png", patterns)).toBe(true);
  });

  it("optimizes https images from allowlisted hosts", () => {
    expect(isOptimizableSrc("https://images.example.com/a.jpg", patterns)).toBe(true);
    expect(isOptimizableSrc("https://abc.blob.example.net/a.jpg", patterns)).toBe(true);
  });

  it("does not optimize (i.e. does not proxy) an arbitrary host", () => {
    expect(isOptimizableSrc("https://evil.example.org/a.jpg", patterns)).toBe(false);
  });

  it("does not optimize insecure, protocol-relative, data or malformed sources", () => {
    expect(isOptimizableSrc("http://images.example.com/a.jpg", patterns)).toBe(false);
    expect(isOptimizableSrc("//images.example.com/a.jpg", patterns)).toBe(false);
    expect(isOptimizableSrc("data:image/png;base64,AAAA", patterns)).toBe(false);
    expect(isOptimizableSrc("not a url", patterns)).toBe(false);
  });
});

describe("configuration", () => {
  it("never allows every host", () => {
    expect(imageHostPatterns("")).not.toContain("**");
    expect(imageHostPatterns("")).not.toContain("*");
  });

  it("appends hosts from NEXT_PUBLIC_IMAGE_HOSTS, trimmed and lower-cased", () => {
    expect(imageHostPatterns(" Images.Shop.com , *.cdn.shop.com ,")).toEqual(
      expect.arrayContaining(["images.shop.com", "*.cdn.shop.com"])
    );
  });

  it("emits https-only remotePatterns for next.config", () => {
    const patterns = imageRemotePatterns(["a.example.com"]);

    expect(patterns).toEqual([{ protocol: "https", hostname: "a.example.com" }]);
  });
});
