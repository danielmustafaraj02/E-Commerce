import { describe, expect, it } from "vitest";
import { FONT_PAIRINGS, findPairing, googleFontsHref } from "./font-pairings";

describe("font pairings", () => {
  it("has unique ids and non-empty families", () => {
    const ids = FONT_PAIRINGS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of FONT_PAIRINGS) {
      expect(p.heading.trim(), p.id).not.toBe("");
      expect(p.body.trim(), p.id).not.toBe("");
      expect(p.style.trim(), p.id).not.toBe("");
    }
  });

  it("has no two pairings with the same two families", () => {
    const keys = FONT_PAIRINGS.map((p) => `${p.heading}|${p.body}`.toLowerCase());
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("builds a Google Fonts link for every pairing", () => {
    for (const p of FONT_PAIRINGS) {
      const href = googleFontsHref(p.heading, p.body)!;
      expect(href, p.id).toMatch(/^https:\/\/fonts\.googleapis\.com\/css2\?/);
      expect(href).toContain(encodeURIComponent(p.heading).replace(/%20/g, "+"));
      expect(findPairing(p.heading, p.body)?.id).toBe(p.id);
    }
  });

  it("never turns an unknown name into a request", () => {
    expect(googleFontsHref("Totally Made Up", "Also Fake")).toBeNull();
    expect(googleFontsHref("Evil&url=http://x", "Lora")).toContain("family=Lora");
    expect(googleFontsHref("Evil&url=http://x", "Lora")).not.toContain("evil");
  });
});
