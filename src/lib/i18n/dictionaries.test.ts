import { describe, expect, it } from "vitest";
import { getDictionary } from "./dictionaries";
import { locales, type Locale } from "./locale-constants";

// Flattens the dictionary to "path" -> string. Function entries (templates such
// as `signedInAs(email)`) are called with marker arguments so their output can
// be checked the same way.
function flatten(value: unknown, path = "", out = new Map<string, string>()) {
  if (typeof value === "string") out.set(path, value);
  else if (typeof value === "function") {
    const args = Array.from({ length: value.length }, (_, i) => `§${i + 1}§`);
    out.set(`${path}()`, String(value(...args)));
  } else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, path ? `${path}.${key}` : key, out);
    }
  }
  return out;
}

const dictionaries = Object.fromEntries(
  locales.map((locale) => [locale, flatten(getDictionary(locale))])
) as Record<Locale, Map<string, string>>;
const english = dictionaries.en;
const others = locales.filter((locale) => locale !== "en");

const placeholders = (text: string) => (text.match(/\{[^}]+\}|§\d+§/g) ?? []).sort().join("|");

const SCRIPTS = {
  Arabic: /[؀-ۿ]/,
  CJK: /[一-鿿぀-ヿ]/,
  Cyrillic: /[Ѐ-ӿ]/,
  Devanagari: /[ऀ-ॿ]/,
};
const OWN_SCRIPT: Partial<Record<Locale, keyof typeof SCRIPTS>> = {
  ar: "Arabic",
  zh: "CJK",
  ja: "CJK",
  ru: "Cyrillic",
  hi: "Devanagari",
};

describe.each(others)("UI translations: %s", (locale) => {
  const dictionary = dictionaries[locale];

  it("has exactly the same keys as English", () => {
    expect([...dictionary.keys()].sort()).toEqual([...english.keys()].sort());
  });

  it("has no empty strings", () => {
    const empty = [...dictionary].filter(([, value]) => !value.trim()).map(([key]) => key);
    expect(empty).toEqual([]);
  });

  it("keeps every {placeholder} the English text has", () => {
    const mismatched = [...english]
      .filter(([key, value]) => placeholders(value) !== placeholders(dictionary.get(key) ?? ""))
      .map(([key]) => key);
    expect(mismatched).toEqual([]);
  });

  it("does not mix in another language's script", () => {
    const own = OWN_SCRIPT[locale];
    const stray = [...dictionary]
      .filter(([, value]) =>
        Object.entries(SCRIPTS).some(([name, pattern]) => name !== own && pattern.test(value))
      )
      .map(([key]) => key);
    expect(stray).toEqual([]);
  });

  it("does not leave long sentences in English", () => {
    const untranslated = [...english]
      .filter(([key, value]) => value.length > 20 && dictionary.get(key) === value)
      .map(([key]) => key);
    expect(untranslated).toEqual([]);
  });
});

describe("register and variant consistency", () => {
  it("Portuguese is European Portuguese (the site's locale is pt-PT), not Brazilian", () => {
    // "sua/seu" are fine in both; these are Brazilian-only.
    const brazilian = /\b(você|senha|equipe|usuário|celular|fazer login|entre com)\b|\blogin\b/i;
    const found = [...dictionaries.pt].filter(([, value]) => brazilian.test(value)).map(([k]) => k);
    expect(found).toEqual([]);
  });

  it("German addresses the reader formally (Sie), never with du", () => {
    const informal = /\b(du|dein\w*|dir|dich)\b/i;
    const found = [...dictionaries.de].filter(([, value]) => informal.test(value)).map(([k]) => k);
    expect(found).toEqual([]);
  });

  it("Japanese uses 撤回権, not the Japan-specific クーリングオフ, for the EU withdrawal right", () => {
    const found = [...dictionaries.ja].filter(([, value]) => value.includes("クーリングオフ"));
    expect(found).toEqual([]);
  });
});
