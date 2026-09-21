import { describe, expect, it } from "vitest";
import { localizedDescription, localizedName } from "./product-i18n";

const product = {
  name: "Bracciale Laguna Azzurra", // Italian: the source language
  nameEn: "Azure Lagoon Bracelet",
  nameFr: "Bracelet Lagune Azur",
  description: "Un bracciale di perle.",
  descriptionEn: "A bracelet of beads.",
  descriptionFr: "Un bracelet de perles.",
};

describe("localizedName", () => {
  it("shows the Italian source name to Italian visitors, not the English one", () => {
    expect(localizedName(product, "it")).toBe("Bracciale Laguna Azzurra");
  });

  it("shows the English name in English, falling back to the Italian one", () => {
    expect(localizedName(product, "en")).toBe("Azure Lagoon Bracelet");
    expect(localizedName({ name: "Solo italiano" }, "en")).toBe("Solo italiano");
  });

  it("uses the locale's own translation when there is one", () => {
    expect(localizedName(product, "fr")).toBe("Bracelet Lagune Azur");
  });

  it("falls back to English, then Italian, when a locale has no translation", () => {
    expect(localizedName(product, "ja")).toBe("Azure Lagoon Bracelet");
    expect(localizedName({ name: "Solo italiano" }, "ja")).toBe("Solo italiano");
  });
});

describe("localizedDescription", () => {
  it("shows the Italian source description to Italian visitors", () => {
    expect(localizedDescription(product, "it")).toBe("Un bracciale di perle.");
  });

  it("falls back English-first for other locales, and is never undefined", () => {
    expect(localizedDescription(product, "fr")).toBe("Un bracelet de perles.");
    expect(localizedDescription(product, "de")).toBe("A bracelet of beads.");
    expect(localizedDescription({ name: "Solo nome" }, "en")).toBe("");
  });
});
