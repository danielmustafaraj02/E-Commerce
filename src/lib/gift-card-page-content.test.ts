import { describe, expect, it } from "vitest";
import { getGiftCardPageContent } from "./gift-card-page-content";
import { locales } from "./i18n/locale-constants";

const english = getGiftCardPageContent("en");

// Every string in the content, keyed by its path.
function flatten(value: unknown, path = "", out = new Map<string, string>()) {
  if (typeof value === "string") out.set(path, value);
  else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) flatten(child, `${path}.${key}`, out);
  }
  return out;
}
const placeholders = (text: string) => (text.match(/\{[^}]+\}/g) ?? []).sort().join("|");

describe.each(locales.filter((locale) => locale !== "en"))("gift card page: %s", (locale) => {
  const content = flatten(getGiftCardPageContent(locale));
  const reference = flatten(english);

  it("has the same sections, lists and questions as English", () => {
    expect([...content.keys()].sort()).toEqual([...reference.keys()].sort());
  });

  it("keeps every {price} and translates the text", () => {
    for (const [key, text] of reference) {
      const translated = content.get(key) ?? "";
      expect(translated.trim(), key).not.toBe("");
      expect(placeholders(translated), key).toBe(placeholders(text));
      if (text.length > 20) expect(translated, key).not.toBe(text);
    }
  });
});

describe("gift card page register", () => {
  // The sample lines (".idea") and quoted examples are written from one
  // person to another, so they may say "du"; the page speaks to the reader.
  const addressing = (locale: "de" | "pt") =>
    [...flatten(getGiftCardPageContent(locale))]
      .filter(([key]) => !key.endsWith(".idea"))
      .map(([, text]) => text.replace(/[„«][^“»]*[“»]/g, ""))
      .join(" ");

  it("German uses Sie and Portuguese is European", () => {
    expect(addressing("de")).not.toMatch(/\b(du|dein\w*|dir|dich)\b/i);
    expect(addressing("pt")).not.toMatch(
      /(?<![\p{L}])(você|equipe|usuário|celular|checkout)(?![\p{L}])/iu
    );
  });

  it("the English meta title and description fit search results", () => {
    expect(english.metaTitle.length).toBeLessThanOrEqual(45);
    expect(english.metaDescription.replace("{price}", "5,00 €").length).toBeLessThanOrEqual(165);
  });
});
