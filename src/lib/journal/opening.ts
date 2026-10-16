/**
 * The article opening — title, details and main photograph — as ten numbered
 * templates, plus the per-article adjustments made by dragging in
 * Admin > Articles (move, resize, rotate). Free of server imports so the
 * editor can use it in the browser.
 */

/** Stored ids, in template-number order (Template 1 = "classic"). */
export const ARTICLE_OPENING_TEMPLATES = [
  "classic",
  "framed",
  "split",
  "overlap",
  "blended",
  "cover",
  "portrait",
  "masthead",
  "inset",
  "offset",
] as const;
export type ArticleOpeningTemplate = (typeof ARTICLE_OPENING_TEMPLATES)[number];

/** What each numbered template does, in words an editor can act on. */
export const OPENING_DESCRIPTIONS: Record<ArticleOpeningTemplate, string> = {
  classic: "Centred title above a wide photograph. Calm and safe for any article.",
  framed: "Cream paper with a double hairline frame; the photograph sits inside it.",
  split: "Title on the left, tall photograph on the right. On phones the title goes first.",
  overlap: "A paper card with the title lies partly on the photograph, partly outside it.",
  blended: "The title runs across the photograph without a card; letters invert over the image.",
  cover: "The photograph fills the opening and the title sits on it in white, over a dark veil.",
  portrait: "Paper column beside a framed photograph shown whole, never cropped.",
  masthead: "Large typographic title between fine rules, with a panoramic photograph below.",
  inset: "Wide photograph; the title card overlaps its bottom edge, half in and half out.",
  offset: "Photograph on the left; the title steps in over its right edge from the right.",
};

export const openingNumber = (id: ArticleOpeningTemplate) => ARTICLE_OPENING_TEMPLATES.indexOf(id) + 1;

/**
 * The house opening: every article on the site opens this way (chosen by the
 * store owner from "Vetro di Murano, VI": Template 5, the title running across
 * the photograph, with its title at 89% and the photograph 38% tall, nudged up).
 */
export const HOUSE_OPENING = {
  template: "blended",
  layout: { title: { size: 89 }, image: { y: -0.5, h: 38 } },
} as const satisfies { template: ArticleOpeningTemplate; layout: OpeningLayout };

export function isOpeningTemplate(value: unknown): value is ArticleOpeningTemplate {
  return (ARTICLE_OPENING_TEMPLATES as readonly unknown[]).includes(value);
}

/** The parts an editor can drag, and what each can do. */
export const OPENING_PARTS = {
  head: { label: "Text block", fields: ["x", "y", "w"] },
  title: { label: "Title", fields: ["x", "y", "size", "rotate"] },
  image: { label: "Photograph", fields: ["x", "y", "w", "h", "rotate"] },
  meta: { label: "Details (date, reading time)", fields: ["x", "y", "size"] },
} as const;
export type OpeningPart = keyof typeof OPENING_PARTS;
type Field = "x" | "y" | "w" | "h" | "size" | "rotate";

/**
 * Units are relative to the opening's width (x, y, w, h: percent of it) so a
 * design looks the same at every screen size; size is a percent of the
 * template's title size. Moves, widths and rotation apply on wide screens —
 * on phones the template's own stacked layout is kept, at the chosen title size.
 */
export type OpeningAdjust = Partial<Record<Field, number>>;
export type OpeningLayout = Partial<Record<OpeningPart, OpeningAdjust>> & {
  /** How the text reads over the photo: on a translucent light panel (dark
   *  text) or a translucent dark panel (white text). Absent = the template's own. */
  text?: OpeningText;
  /** How much the photo is darkened under text that sits on it, % (0–80). */
  shade?: number;
};
export const OPENING_TEXT_STYLES = {
  shadow: "White letters with a soft shadow — for text fully on the photo (Template 6)",
  panel: "Dark text on a translucent light panel",
  "panel-dark": "White text on a translucent dark panel",
  invert: "Letters change colour where they cross the photograph (as in Template 5)",
} as const;
export type OpeningText = keyof typeof OPENING_TEXT_STYLES;

export const OPENING_LIMITS: Record<Field, [min: number, max: number]> = {
  x: [-60, 60],
  y: [-40, 40],
  w: [15, 100],
  h: [10, 120],
  size: [40, 250],
  rotate: [-180, 180],
};

/** Tolerant read of stored or submitted adjustments: unknown keys dropped, numbers clamped. */
export function parseOpeningLayout(value: unknown): OpeningLayout {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: OpeningLayout = {};
  for (const part of Object.keys(OPENING_PARTS) as OpeningPart[]) {
    const raw = (value as Record<string, unknown>)[part];
    if (!raw || typeof raw !== "object") continue;
    const adjust: OpeningAdjust = {};
    for (const field of OPENING_PARTS[part].fields) {
      const n = (raw as Record<string, unknown>)[field];
      if (typeof n !== "number" || !Number.isFinite(n)) continue;
      const [lo, hi] = OPENING_LIMITS[field];
      adjust[field] = Math.round(Math.max(lo, Math.min(hi, n)) * 10) / 10;
    }
    if (Object.keys(adjust).length) out[part] = adjust;
  }
  const text = (value as Record<string, unknown>).text;
  if (typeof text === "string" && text in OPENING_TEXT_STYLES) out.text = text as OpeningText;
  const shade = (value as Record<string, unknown>).shade;
  if (typeof shade === "number" && Number.isFinite(shade)) out.shade = Math.round(Math.max(0, Math.min(80, shade)));
  return out;
}

/** The inline CSS variables and markers for one part (read by article-opening.css). */
export function openingPartProps(layout: OpeningLayout | undefined, part: OpeningPart) {
  const a = layout?.[part] ?? {};
  const style: Record<string, string> = {};
  if (a.x !== undefined) style["--o-x"] = String(a.x);
  if (a.y !== undefined) style["--o-y"] = String(a.y);
  if (a.w !== undefined) style["--o-w"] = String(a.w);
  if (a.h !== undefined) style["--o-h"] = String(a.h);
  if (a.size !== undefined) style["--o-size"] = String(a.size / 100);
  if (a.rotate !== undefined) style["--o-rot"] = `${a.rotate}deg`;
  return {
    "data-opening-part": part,
    ...(a.w !== undefined && { "data-o-w": "" }),
    ...(a.h !== undefined && { "data-o-h": "" }),
    style,
  };
}

/** The site-wide template from the Article page layout's "head" section options. */
export function siteOpeningTemplate(
  entries: readonly { id: string; options?: Record<string, string> }[]
): ArticleOpeningTemplate {
  const value = entries.find((entry) => entry.id === "head")?.options?.articleOpening;
  return isOpeningTemplate(value) ? value : "classic";
}
