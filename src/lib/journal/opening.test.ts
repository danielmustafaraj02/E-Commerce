import { describe, expect, it } from "vitest";
import {
  ARTICLE_OPENING_TEMPLATES,
  OPENING_DESCRIPTIONS,
  openingNumber,
  openingPartProps,
  parseOpeningLayout,
  siteOpeningTemplate,
} from "./opening";

describe("article opening templates", () => {
  it("are ten, numbered in order, each with a description", () => {
    expect(ARTICLE_OPENING_TEMPLATES).toHaveLength(10);
    expect(openingNumber("classic")).toBe(1);
    expect(openingNumber("offset")).toBe(10);
    for (const id of ARTICLE_OPENING_TEMPLATES) expect(OPENING_DESCRIPTIONS[id].length).toBeGreaterThan(20);
  });

  it("falls back to the site-wide choice, then Template 1", () => {
    expect(siteOpeningTemplate([{ id: "head", options: { articleOpening: "cover" } }])).toBe("cover");
    expect(siteOpeningTemplate([{ id: "head", options: { articleOpening: "nope" } }])).toBe("classic");
    expect(siteOpeningTemplate([])).toBe("classic");
  });
});

describe("per-article opening adjustments", () => {
  it("keeps only each part's own fields, clamped and rounded", () => {
    expect(
      parseOpeningLayout({
        head: { x: 12.345, w: 500, size: 200 },
        title: { size: 10, rotate: 45, h: 30 },
        image: { y: -99, h: 50, rotate: "5" },
        other: { x: 1 },
      })
    ).toEqual({
      head: { x: 12.3, w: 100 },
      title: { size: 40, rotate: 45 },
      image: { y: -40, h: 50 },
    });
    expect(parseOpeningLayout(null)).toEqual({});
    expect(parseOpeningLayout([1])).toEqual({});
  });

  it("becomes CSS variables and markers on the part", () => {
    expect(openingPartProps({ image: { x: 5, w: 60, rotate: -3 } }, "image")).toEqual({
      "data-opening-part": "image",
      "data-o-w": "",
      style: { "--o-x": "5", "--o-w": "60", "--o-rot": "-3deg" },
    });
    expect(openingPartProps({ title: { size: 150 } }, "title").style).toEqual({ "--o-size": "1.5" });
    expect(openingPartProps(undefined, "head")).toEqual({ "data-opening-part": "head", style: {} });
  });
});

describe("opening text panel", () => {
  it("keeps only known text styles", () => {
    expect(parseOpeningLayout({ text: "panel" })).toEqual({ text: "panel" });
    expect(parseOpeningLayout({ text: "neon" })).toEqual({});
    expect(parseOpeningLayout({ meta: { size: 120, w: 50 } })).toEqual({ meta: { size: 120 } });
  });
});

describe("opening photo darkening", () => {
  it("is clamped to 0–80 and the shadow text style is accepted", () => {
    expect(parseOpeningLayout({ shade: 120, text: "shadow" })).toEqual({ shade: 80, text: "shadow" });
    expect(parseOpeningLayout({ shade: -5 })).toEqual({ shade: 0 });
  });
});
