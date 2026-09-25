import { describe, expect, it } from "vitest";
import manifest from "./murano-manifest.json";
import {
  CATEGORY_NAMES,
  LOCALE_SUFFIXES,
  categoryTranslations,
  findManifestEntry,
  productTranslations,
  type ManifestEntry,
} from "./i18n-fields";

const entries = Object.values(manifest as Record<string, ManifestEntry>);

describe("murano manifest translations", () => {
  it("has a non-empty name and description in every locale for every product", () => {
    const missing: string[] = [];
    for (const entry of entries) {
      for (const suffix of LOCALE_SUFFIXES) {
        if (!entry[`name${suffix}`]?.trim()) missing.push(`${entry.name}: name${suffix}`);
        if (!entry[`description${suffix}`]?.trim()) {
          missing.push(`${entry.name}: description${suffix}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it("never reuses the Italian text as a translation", () => {
    const untranslated: string[] = [];
    for (const entry of entries) {
      for (const suffix of LOCALE_SUFFIXES) {
        if (entry[`description${suffix}`] === entry.description) {
          untranslated.push(`${entry.name}: description${suffix}`);
        }
      }
    }
    expect(untranslated).toEqual([]);
  });

  it("has a translated name for every category used by the manifest, in every locale", () => {
    for (const category of new Set(entries.map((entry) => entry.category))) {
      const names = categoryTranslations(category);
      for (const suffix of LOCALE_SUFFIXES) {
        expect(names[`name${suffix}`], `${category} / ${suffix}`).toBeTruthy();
      }
    }
    expect(Object.keys(CATEGORY_NAMES).sort()).toEqual(
      [...new Set(entries.map((entry) => entry.category))].sort()
    );
  });
});

describe("productTranslations", () => {
  it("returns a name and description field for each locale", () => {
    const data = productTranslations(entries[0]);
    expect(Object.keys(data)).toHaveLength(LOCALE_SUFFIXES.length * 2);
    expect(data.nameJa).toBe(entries[0].nameJa);
  });
});

describe("murano manifest wording", () => {
  const byLocale = (suffix: "Ar" | "De" | "Pt" | "Ru", pattern: RegExp) =>
    entries
      .filter((entry) => pattern.test(`${entry[`name${suffix}`]} ${entry[`description${suffix}`]}`))
      .map((entry) => `${entry.nameEn} (${suffix})`);

  it("does not turn 'silver-toned' into a plating claim (German 'versilbert')", () => {
    // Only "silvered hematite" in the English copy is genuinely plated.
    const wrong = entries
      .filter((entry) => /versilbert/i.test(entry.descriptionDe ?? ""))
      .filter((entry) => !/silvered/i.test(entry.descriptionEn ?? ""))
      .map((entry) => entry.nameEn);
    expect(wrong).toEqual([]);
  });

  it("does not turn 'gold-toned' into 'gold-plated' (Russian 'позолоч…')", () => {
    const wrong = entries
      .filter((entry) => /позолоч/i.test(entry.descriptionRu ?? ""))
      .filter((entry) => !/gold[- ]plated|gilded/i.test(entry.descriptionEn ?? ""))
      .map((entry) => entry.nameEn);
    expect(wrong).toEqual([]);
  });

  it("names the sage colour in Arabic with a colour word, not the plant's transliteration", () => {
    expect(byLocale("Ar", /سلفيا/)).toEqual([]);
  });

  it("Portuguese copy is European Portuguese (site locale is pt-PT)", () => {
    const brazilian =
      /miçang|\bcinza\b|lagosta|ônix|peônia|cabuchão|tricô|boêmi|\bvocê\b|\bequipe\b/i;
    expect(byLocale("Pt", brazilian)).toEqual([]);
  });

  it("uses the site's spellings: 'vidrio de Murano' (es) and 'ムラノ' (ja)", () => {
    const es = entries.filter((entry) => /cristal de Murano/i.test(entry.descriptionEs ?? ""));
    const ja = entries.filter((entry) => /ムラーノ/.test(entry.descriptionJa ?? ""));
    expect(es.map((entry) => entry.nameEn)).toEqual([]);
    expect(ja.map((entry) => entry.nameEn)).toEqual([]);
  });

  it("uses Hindi punctuation instead of an em dash (U+2014) in Hindi copy", () => {
    const withEmDash = entries
      .filter((entry) => `${entry.nameHi} ${entry.descriptionHi}`.includes("—"))
      .map((entry) => entry.nameEn);
    expect(withEmDash).toEqual([]);
  });
});

describe("findManifestEntry", () => {
  const entry = entries[0];
  const slug = `${entry.name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")}-abc123`.replace(/--+/g, "-");

  it("matches by the Italian name", () => {
    expect(findManifestEntry({ name: entry.name }, entries)).toBe(entry);
  });

  it("matches a row whose name was edited to English (as on production)", () => {
    expect(findManifestEntry({ name: entry.nameEn ?? "" }, entries)).toBe(entry);
  });

  it("falls back to the slug when the name matches nothing", () => {
    expect(findManifestEntry({ name: "Something renamed", slug }, entries)).toBe(entry);
  });

  it("returns nothing for an unknown product", () => {
    expect(
      findManifestEntry({ name: "Not in the manifest", slug: "nope-abc123" }, entries)
    ).toBeUndefined();
  });
});
