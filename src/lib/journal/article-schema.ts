import { z } from "zod";

/**
 * The shape and rules of an article written in Admin > Articles: categories,
 * block/source/translation schemas, parsers and slugify. Kept free of any
 * database import so the client-side editor (admin/articles/article-form.tsx)
 * can use it without dragging `pg` into the browser bundle — db-articles.ts
 * re-exports everything here, so server code can keep importing from there.
 */

export const JOURNAL_CATEGORIES = ["history", "craft", "buying", "care", "gifting"] as const;

/** Links allowed in text and buttons: site paths or http(s) only, never
 *  javascript:/data: — article text is rendered as links. */
const safeHref = (href: string) => /^(\/(?!\/)|https?:\/\/)/.test(href);

const noUnsafeLinks = (text: string) =>
  [...text.matchAll(/\]\(([^)\s]*)\)/g)].every((m) => safeHref(m[1]));

const text = (max: number) =>
  z.string().trim().min(1).max(max).refine(noUnsafeLinks, "Links must start with / or https://");

const imageSrc = z
  .string()
  .trim()
  .max(2000)
  .refine((src) => /^(\/(?!\/)|https:\/\/)/.test(src), "Image must be a /path or https:// URL");

export const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("p"), text: text(4000) }),
  z.object({ type: z.literal("h2"), text: text(200) }),
  z.object({ type: z.literal("h3"), text: text(200) }),
  z.object({
    type: z.literal("quote"),
    text: text(1000),
    cite: z.string().trim().max(200).optional(),
  }),
  z.object({
    type: z.literal("facts"),
    title: text(120),
    items: z.array(text(300)).min(1).max(12),
  }),
  z.object({
    type: z.literal("image"),
    src: imageSrc,
    alt: z.string().trim().max(300).default(""),
    caption: z.string().trim().max(300).optional(),
  }),
  z.object({
    type: z.literal("products"),
    title: text(120),
    slugs: z.array(z.string().trim().min(1).max(200)).min(1).max(8),
  }),
  z.object({
    type: z.literal("cta"),
    text: text(80),
    href: z.string().trim().max(500).refine(safeHref, "Link must start with / or https://"),
  }),
]);

/** What the admin editor stores. Images are flat here and become JournalImage
 *  blocks only in toArticle. */
export type StoredBlock = z.infer<typeof blockSchema>;
export const bodySchema = z.array(blockSchema).max(80);

/** Tolerant read of the JSON column: invalid blocks are dropped, not thrown. */
export function parseBody(value: unknown): StoredBlock[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const parsed = blockSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

/** A citation. Mirrors Source (types.ts); the url is shown as a link, so only
 *  http(s) is accepted. */
export const sourceSchema = z.object({
  title: z.string().trim().min(1, "Each source needs a title").max(200),
  publisher: z.string().trim().max(200).default(""),
  url: z
    .string()
    .trim()
    .max(1000)
    .refine((u) => /^https?:\/\//.test(u), "Source links must start with https://"),
  usedFor: z.string().trim().max(500).default(""),
  usedForIt: z.string().trim().max(500).optional(),
  accessed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date like 2026-10-04"),
  kind: z.enum(["primary", "scholarly", "institutional", "reference"]).optional(),
});
export const sourcesSchema = z.array(sourceSchema).max(30);
export type StoredSource = z.infer<typeof sourceSchema>;

export function parseSources(value: unknown): StoredSource[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const parsed = sourceSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

/** The Italian version of an article. Title, description and intro are
 *  required for it to count as a translation. */
export const translationItSchema = z.object({
  title: z.string().trim().min(3).max(150),
  seoTitle: z.string().trim().max(70).optional(),
  description: z.string().trim().min(10).max(300),
  intro: z.string().trim().min(10).max(2000),
  heroAlt: z.string().trim().max(300).optional(),
  body: bodySchema,
});
export type StoredTranslationIt = z.infer<typeof translationItSchema>;

export function parseTranslationIt(value: unknown): StoredTranslationIt | null {
  const parsed = translationItSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
