import { describe, expect, it } from "vitest";
import { TITLE_MAX, buildProductMetaDescription, fitTitle } from "./seo-text";

const STORE = "Perla Murano Glass"; // 18 chars; " | " brings the suffix to 21

describe("fitTitle", () => {
  it("keeps the descriptive candidate when it fits with the brand", () => {
    expect(fitTitle(["Ruby Necklace — Murano Glass", "Ruby Necklace"], STORE)).toBe(
      "Ruby Necklace — Murano Glass"
    );
  });

  it("falls back to the plain name when the keyword would overflow", () => {
    const name = "Sage & Gold Wrap Bracelet"; // 25 + 21 + " — Murano Glass" > 60
    expect(fitTitle([`${name} — Murano Glass`, name], STORE)).toBe(name);
  });

  it("never lets title + brand exceed the limit", () => {
    for (const name of [
      "Ruby Necklace",
      "Sage & Gold Wrap Bracelet",
      "Antique Pink Pearl Necklace",
    ]) {
      const result = fitTitle([`${name} — Murano Glass`, name], STORE);
      if (typeof result === "string") {
        expect(result.length + 3 + STORE.length).toBeLessThanOrEqual(TITLE_MAX);
      }
    }
  });

  it("drops the brand (absolute title) when even the name alone is too long with it", () => {
    const name = "An Exceptionally Long Handmade Murano Glass Bracelet Name"; // 57
    expect(fitTitle([name], STORE)).toEqual({ absolute: name });
  });

  it("truncates only a name that is itself over the limit", () => {
    const result = fitTitle(["word ".repeat(20).trim()], STORE);
    expect(typeof result).toBe("object");
    expect((result as { absolute: string }).absolute.length).toBeLessThanOrEqual(TITLE_MAX + 1);
  });
});

describe("buildProductMetaDescription", () => {
  const suffix = "€40.61 · Shop now"; // 17 chars

  it("appends the price and call to action to short copy", () => {
    expect(buildProductMetaDescription({ description: "A lovely bracelet.", suffix })).toBe(
      "A lovely bracelet. €40.61 · Shop now"
    );
  });

  it("never exceeds 155 characters", () => {
    const long =
      "A wraparound band of black and gold beads, with two large sage-green beads — a versatile color that sits comfortably alongside both neutral tones and bolder pieces in your wardrobe. A handmade spiral bracelet, comfortable for everyday wear.";
    expect(buildProductMetaDescription({ description: long, suffix }).length).toBeLessThanOrEqual(
      155
    );
  });

  it("keeps whole sentences when they fit and always ends with the suffix", () => {
    const description =
      "First sentence here. Second sentence is much longer and will not fit within the remaining budget of this snippet at all, no matter how you try.";
    const result = buildProductMetaDescription({ description, suffix, max: 80 });

    expect(result).toBe("First sentence here. " + suffix);
    expect(result.endsWith(suffix)).toBe(true);
  });

  it("cuts a single over-long sentence at a clause, not mid-word", () => {
    const description =
      "A wraparound band of black and gold beads, with two large sage-green beads and a versatile color that sits comfortably alongside everything";
    const result = buildProductMetaDescription({ description, suffix, max: 100 });

    expect(result).toContain("beads…");
    expect(result.endsWith(suffix)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(100);
  });

  it("falls back to a word boundary when there is no clause break", () => {
    const description = "word ".repeat(60).trim();
    const result = buildProductMetaDescription({ description, suffix, max: 60 });

    expect(result.length).toBeLessThanOrEqual(60);
    expect(result).toMatch(/word… €40\.61 · Shop now$/);
  });

  it("handles unspaced scripts (Japanese) by cutting at a sentence or hard limit", () => {
    const description =
      "水色のアクアマリン色の丸ビーズと、ターコイズとサンドが混ざり合った斑入りのオーバルビーズが交互に並ぶ、ハンドメイドのムラノガラスブレスレット。光にかざしたヴェネツィアのラグーンを思わせる透明感のある表情が魅力です。";
    const result = buildProductMetaDescription({
      description,
      suffix: "€40.61 · 今すぐ購入",
      max: 80,
    });

    expect(result.length).toBeLessThanOrEqual(80);
    expect(result.endsWith("€40.61 · 今すぐ購入")).toBe(true);
  });

  it("returns just the suffix when there is no description", () => {
    expect(buildProductMetaDescription({ description: "  ", suffix })).toBe(suffix);
  });
});
