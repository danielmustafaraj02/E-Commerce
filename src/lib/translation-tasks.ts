// One roadmap task per storefront language, each carrying a ready-to-run
// prompt for the coding agent that fills in that language's catalog
// translations (imported from Admin > Roadmap, see
// src/app/admin/roadmap/import-actions.ts). Italian is the source language,
// so it has no task.

type Language = {
  code: string;
  suffix: string;
  name: string;
  style: string;
};

const LANGUAGES: Language[] = [
  {
    code: "en",
    suffix: "En",
    name: "English",
    style:
      "US spelling (jewelry, color), warm and precise. English is what search engines read, so product names should carry the piece type and colour (e.g. 'Scarlet Flame Necklace'). Also fill Product.storyEn, the 'why this piece' copy, from the Italian `story`.",
  },
  {
    code: "de",
    suffix: "De",
    name: "German",
    style:
      "Formal 'Sie' throughout, never 'du'. Muranoglas as one word; compound nouns as German writes them (Muranoglas-Schmuck).",
  },
  {
    code: "fr",
    suffix: "Fr",
    name: "French",
    style:
      "Vouvoiement. French typography: a space before ? ! : ; and « » only if quotes are needed. 'verre de Murano', 'travaillé au chalumeau'.",
  },
  {
    code: "es",
    suffix: "Es",
    name: "Spanish",
    style: "Neutral Spanish, 'tú' as in the existing es dictionary. 'vidrio de Murano'.",
  },
  {
    code: "pt",
    suffix: "Pt",
    name: "European Portuguese",
    style:
      "pt-PT, not Brazilian: 'o seu', 'telemóvel', 'montra', no gerund constructions like 'estou fazendo'. 'vidro de Murano'.",
  },
  {
    code: "ru",
    suffix: "Ru",
    name: "Russian",
    style: "Polite 'вы'. 'муранское стекло'. Cyrillic only, no Latin letters except the store name.",
  },
  {
    code: "ja",
    suffix: "Ja",
    name: "Japanese",
    style:
      "Polite です/ます. Use ムラノ (as in the existing ja dictionary), Japanese punctuation 、。, no Latin text except the store name.",
  },
  {
    code: "zh",
    suffix: "Zh",
    name: "Simplified Chinese",
    style: "Simplified characters, 穆拉诺玻璃, Chinese punctuation ，。, no Latin text except the store name.",
  },
  {
    code: "ar",
    suffix: "Ar",
    name: "Arabic",
    style:
      "Modern Standard Arabic, right-to-left, Arabic comma ، and question mark ؟, زجاج مورانو. No Latin text except the store name.",
  },
  {
    code: "hi",
    suffix: "Hi",
    name: "Hindi",
    style: "Devanagari only (मुरानो ग्लास), respectful 'आप'. No Latin text except the store name.",
  },
];

function prompt({ code, suffix, name, style }: Language) {
  const productFields =
    code === "en"
      ? "Product.nameEn, Product.descriptionEn, Product.storyEn"
      : `Product.name${suffix}, Product.description${suffix}`;
  return `TASK:
Translate the whole catalog of perlamuranoglass.com into ${name} (${code}), and fix any untranslated or awkward ${name} text in the storefront.

SCOPE:
- Database: ${productFields}, Category.name${suffix}, Category.description${suffix}. Italian (name, description, story) is the source: never change it.
- Catalog scripts: scripts/murano-manifest.json, scripts/i18n-fields.ts and scripts/apply-product-i18n.ts were removed from main in commit 4a91b19. Restore them with \`git show 4a91b19^:scripts/<file>\` instead of rewriting them.
- Storefront text: the \`${code}\` blocks of src/lib/i18n/dictionaries.ts and src/lib/murano-guide-content.ts.

REQUIREMENTS:
- Translate from the Italian source, not from another translation.
- Style: ${style}
- Every active product and every category ends with a non-empty ${name} name and description.
- No em dashes (U+2014): use ${name} punctuation instead. Keep {placeholders} and HTML unchanged.
- Glass and technique terms consistent with the existing ${code} dictionary.

IMPLEMENTATION:
1. Read the live Product and Category rows (read-only) and list which ${suffix} fields are empty, still Italian or still English.
2. Add the ${name} text to the manifest for those entries.
3. Run \`npx tsx scripts/apply-product-i18n.ts --dry-run\` and check it reports 0 unmatched products.
4. Apply to the production database only if the owner has provided its DATABASE_URL for this run; otherwise open a pull request with the manifest and give the owner the exact command.
5. Review the ${code} blocks named above and correct what reads badly.

PRESERVE:
Italian source text, slugs, prices, stock, images, and every other language's fields.

QUALITY CHECK:
- npm run typecheck and npm test pass (dictionaries.test.ts checks placeholders and script mixing).
- The dry run lists the expected number of products and categories and 0 unmatched.
- With the language switcher on ${name}, three product pages and one category page show only ${name}.
- Report how many products and categories were updated and anything left untranslated.`;
}

export type TranslationTask = { title: string; description: string };

export const TRANSLATION_TASKS: TranslationTask[] = LANGUAGES.map((language) => ({
  title: `Translate the catalog into ${language.name} (${language.code})`,
  description: prompt(language),
}));

export function missingTranslationTasks(existingTitles: Iterable<string>): TranslationTask[] {
  const have = new Set(existingTitles);
  return TRANSLATION_TASKS.filter((task) => !have.has(task.title));
}

// Open, medium priority and flagged for the nightly Claude routine; the first
// language gets the newest timestamp so the list keeps this order.
export function translationTaskRows(tasks: TranslationTask[], now = new Date()) {
  return tasks.map((task, index) => ({
    title: task.title,
    description: task.description,
    priority: "medium",
    status: "open",
    forClaude: true,
    createdAt: new Date(now.getTime() - index * 1000),
  }));
}
