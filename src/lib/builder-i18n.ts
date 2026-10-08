import { locales, type Locale } from "@/lib/i18n/locale-constants";
import type { BuilderBlock, BuilderDoc } from "@/lib/section-builder";

/**
 * Languages for designs made with the visual editor.
 *
 * The site speaks eleven languages, but a design is one document. Two things
 * keep a design multilingual:
 *
 *  - Site text: any text can be (or contain) a reference like
 *    `{{home.heroSubtitle}}`, which is replaced by the site's own text in the
 *    visitor's language (including Admin > Settings > Page text). The built-in
 *    templates are written this way, so a recreated section keeps following
 *    the translations.
 *  - Per-language text: a block can carry its own wording for any language
 *    (`tr`), used instead of its main text for that language.
 */

/** The text fields of each block type that can be translated. */
export const TRANSLATABLE: Record<string, readonly string[]> = {
  heading: ["text"],
  text: ["text"],
  button: ["text"],
  quote: ["text", "cite"],
  icon: ["title", "text"],
  badge: ["text"],
  eyebrow: ["text", "number"],
  counter: ["label"],
  stars: ["label"],
  countdown: ["label"],
  story: ["eyebrow", "title", "text", "cta", "cardTitle", "cardPrice", "cardCta"],
};

export const TRANSLATABLE_LABELS: Record<string, string> = {
  text: "Text",
  cite: "Who said it",
  title: "Title",
  number: "Number",
  label: "Label",
  eyebrow: "Small label",
  cta: "Button",
  cardTitle: "Card title",
  cardPrice: "Card price",
  cardCta: "Card link",
};

export type BlockTranslations = Partial<Record<Locale, Record<string, string>>>;

/** Keeps only known languages, translatable fields and plain strings. */
export function parseTranslations(type: string, value: unknown): BlockTranslations | undefined {
  const fields = TRANSLATABLE[type];
  if (!fields || !value || typeof value !== "object") return undefined;
  const out: BlockTranslations = {};
  for (const locale of locales) {
    const entry = (value as Record<string, unknown>)[locale];
    if (!entry || typeof entry !== "object") continue;
    const clean: Record<string, string> = {};
    for (const field of fields) {
      const text = (entry as Record<string, unknown>)[field];
      if (typeof text === "string" && text.trim()) clean[field] = text.slice(0, 2000);
    }
    if (Object.keys(clean).length) out[locale] = clean;
  }
  return Object.keys(out).length ? out : undefined;
}

/** Looks a site-text reference up: a dotted path into the dictionary. Text
 *  that needs the store's name (a function in the dictionary) gets it. */
export type SiteText = (path: string) => string | undefined;

export function dictionaryText(dict: unknown, storeName: string): SiteText {
  return (path) => {
    if (path === "store.name") return storeName;
    let node: unknown = dict;
    for (const part of path.split(".")) {
      if (!node || typeof node !== "object") return undefined;
      node = (node as Record<string, unknown>)[part];
    }
    if (typeof node === "string") return node;
    if (typeof node === "function") {
      try {
        const value = (node as (name: string) => unknown)(storeName);
        return typeof value === "string" ? value : undefined;
      } catch {
        return undefined;
      }
    }
    return undefined;
  };
}

/** Every site text as path → text, for the editor's preview (one language). */
export function flattenDictionary(dict: unknown, storeName: string): Record<string, string> {
  const out: Record<string, string> = { "store.name": storeName };
  const walk = (node: unknown, prefix: string, depth: number) => {
    if (depth > 6 || !node || typeof node !== "object") return;
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (typeof value === "string") out[path] = value;
      else if (typeof value === "function") {
        try {
          const text = (value as (name: string) => unknown)(storeName);
          if (typeof text === "string") out[path] = text;
        } catch {
          /* needs other arguments: not usable as site text */
        }
      } else if (value && typeof value === "object" && !Array.isArray(value))
        walk(value, path, depth + 1);
    }
  };
  walk(dict, "", 0);
  return out;
}

export const fromMap =
  (map: Record<string, string>): SiteText =>
  (path) =>
    map[path];

const TOKEN = /\{\{\s*([\w.-]+)\s*\}\}/g;

/** Replaces `{{path}}` references; unknown ones are left visible. */
export const resolveTokens = (value: string, text: SiteText) =>
  value.includes("{{") ? value.replace(TOKEN, (match, path: string) => text(path) ?? match) : value;

export const hasTokens = (value: string) => /\{\{\s*[\w.-]+\s*\}\}/.test(value);

function localizeBlock(block: BuilderBlock, locale: Locale | null, text: SiteText): BuilderBlock {
  const fields = TRANSLATABLE[block.type] ?? [];
  const own = locale ? block.tr?.[locale] : undefined;
  const next: Record<string, unknown> = { ...block };
  for (const field of fields) {
    const base = own?.[field] ?? next[field];
    if (typeof base === "string") next[field] = resolveTokens(base, text);
  }
  if (block.type === "list") next.items = block.items.map((item) => resolveTokens(item, text));
  if (block.type === "faq")
    next.items = block.items.map((i) => ({
      q: resolveTokens(i.q, text),
      a: resolveTokens(i.a, text),
    }));
  if (block.type === "showcase" && block.scenes) {
    const scenes: Record<string, unknown> = {};
    for (const [key, scene] of Object.entries(block.scenes)) {
      if (!scene) continue;
      scenes[key] = {
        ...scene,
        ...(scene.name && { name: resolveTokens(scene.name, text) }),
        ...(scene.description && { description: resolveTokens(scene.description, text) }),
        ...(scene.cta && { cta: resolveTokens(scene.cta, text) }),
      };
    }
    next.scenes = scenes;
  }
  delete next.tr;
  return next as BuilderBlock;
}

/** The design in one language: per-language text applied, references resolved. */
export function localizeDoc(doc: BuilderDoc, locale: Locale | null, text: SiteText): BuilderDoc {
  return {
    ...doc,
    cells: doc.cells.map((cell) => cell.map((block) => localizeBlock(block, locale, text))),
  };
}

/** True when the design uses site text or per-language text anywhere. */
export function docNeedsLocalizing(doc: BuilderDoc): boolean {
  return doc.cells.some((cell) =>
    cell.some((block) => !!block.tr || JSON.stringify(block).includes("{{"))
  );
}
