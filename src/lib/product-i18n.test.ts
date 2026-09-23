import { describe, expect, it } from "vitest";
import { localizedDescription, localizedName, localizedStory } from "./product-i18n";

const product = {
  name: "Bracciale Laguna Azzurra", // Italian: the source language
  nameEn: "Azure Lagoon Bracelet",
  nameFr: "Bracelet Lagune Azur",
  description: "Un bracciale di perle.",
  descriptionEn: "A bracelet of beads.",
  descriptionFr: "Un bracelet de perles.",
  story: "Ogni perla è unica.",
  storyEn: "Every bead is unique.",
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

describe("localizedStory", () => {
  it("shows the Italian source story to Italian visitors", () => {
    expect(localizedStory(product, "it")).toBe("Ogni perla è unica.");
  });

  it("falls back to English for every other locale — there's no per-locale field yet", () => {
    expect(localizedStory(product, "en")).toBe("Every bead is unique.");
    expect(localizedStory(product, "fr")).toBe("Every bead is unique.");
    expect(localizedStory(product, "ja")).toBe("Every bead is unique.");
  });

  it("falls back to Italian when English is missing, and is never undefined", () => {
    expect(localizedStory({ name: "Solo italiano", story: "Storia." }, "en")).toBe("Storia.");
    expect(localizedStory({ name: "Solo nome" }, "en")).toBe("");
  });
});
