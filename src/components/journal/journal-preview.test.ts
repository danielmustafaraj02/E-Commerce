import { describe, expect, it } from "vitest";
import { previewArticles } from "./journal-preview";

const all = ["a", "b", "c", "d"].map((slug) => ({ slug }));
const slugs = (picks: (string | undefined)[]) => previewArticles(all, picks).map((a) => a.slug);

describe("previewArticles", () => {
  it("shows the newest three by default", () => expect(slugs([])).toEqual(["a", "b", "c"]));
  it("puts chosen articles in their place and fills the rest with the newest", () =>
    expect(slugs([undefined, "d", undefined])).toEqual(["a", "d", "b"]));
  it("ignores an unknown choice", () => expect(slugs(["zzz", "c"])).toEqual(["a", "c", "b"]));
});
