import { describe, expect, it } from "vitest";
import { mergePageMeta } from "./page-meta";

describe("mergePageMeta", () => {
  const base = { title: "Old", description: "Old description", openGraph: { title: "Old" } };
  it("returns the base untouched without an override", () => {
    expect(mergePageMeta(base, null)).toBe(base);
    expect(
      mergePageMeta(base, { title: " ", description: null, ogImageUrl: null, noindex: false })
    ).toBe(base);
  });
  it("overrides title and description everywhere they appear", () => {
    const merged = mergePageMeta(base, {
      title: "New",
      description: "New description",
      ogImageUrl: null,
      noindex: false,
    });
    expect(merged.title).toEqual({ absolute: "New" });
    expect(merged.description).toBe("New description");
    expect(merged.openGraph?.title).toBe("New");
    expect(merged.twitter?.title).toBe("New");
  });
  it("keeps what is not overridden and can noindex", () => {
    const merged = mergePageMeta(base, {
      title: null,
      description: "Only this",
      ogImageUrl: "https://x.test/a.jpg",
      noindex: true,
    });
    expect(merged.title).toBe("Old");
    expect(merged.description).toBe("Only this");
    expect(merged.robots).toEqual({ index: false, follow: false });
  });
});
