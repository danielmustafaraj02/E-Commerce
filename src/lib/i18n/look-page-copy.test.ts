import { describe, expect, it } from "vitest";
import { getLookEditorialDescription, getLookPageCopy } from "./look-page-copy";

describe("getLookEditorialDescription", () => {
  const names = [
    "Rosso Rubino",
    "Rosa e Salvia",
    "Medaglioni Rosa e Sabbia · Ottobre 2026",
    "Medaglioni Turchesi · Ottobre 2026",
    "Arabeschi Sabbia e Nero · Ottobre 2026",
    "Arabeschi Turchese e Corallo · Ottobre 2026",
    "Sfere Notte · Ottobre 2026",
    "Sfere Rosso · Ottobre 2026",
    "Perle Salvia · Ottobre 2026",
    "Perle Rosa · Ottobre 2026",
  ];

  it("gives every look its own text, in English and Italian", () => {
    for (const locale of ["en", "it"] as const) {
      const texts = names.map((name) => getLookEditorialDescription(name, locale));
      expect(new Set(texts).size).toBe(names.length);
      expect(texts).not.toContain(getLookPageCopy(locale).editorialDescription);
    }
  });

  it("falls back to the general text for a look without its own", () => {
    expect(getLookEditorialDescription("A New Look", "en")).toBe(getLookPageCopy("en").editorialDescription);
  });

  it("claims handmade in Murano only for the October 2026 looks", () => {
    expect(getLookEditorialDescription("Rosso Rubino", "en")).not.toMatch(/handmade/i);
    expect(getLookEditorialDescription("Rosa e Salvia", "en")).not.toMatch(/handmade/i);
  });
});
