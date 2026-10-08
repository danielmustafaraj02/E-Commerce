/**
 * Page builder model: which sections the home page and product pages show, and
 * in what order. Pure (no DB, no React) so the rules are unit-testable; the
 * admin editor and both storefront pages only consume it.
 *
 * Stored as [{ id, visible }] on StoreSettings. Reading always goes through
 * `resolveLayout`, which drops unknown ids, de-duplicates, and appends any
 * section missing from the stored list at its default position — so shipping a
 * new section never requires a data migration and a null column means "default".
 */

import { parseBuilder, type BuilderDoc } from "@/lib/section-builder";
import { BOLD_TEMPLATE_IDS, EDITORIAL_TEMPLATE_META } from "@/lib/look-templates";
import {
  CUSTOM_ID_RE,
  MAX_CUSTOM_CSS,
  MAX_CUSTOM_HTML,
  MAX_CUSTOM_SECTIONS,
  MAX_OVERRIDE_HTML,
  MAX_SECTION_CSS,
  safeColor,
  safeImageUrl,
  safeVideoUrl,
} from "@/lib/custom-section";

export type SectionMeta = {
  id: string;
  label: string;
  hint: string;
  /** A section that must stay the real thing (it carries the buy box): it can be
   *  moved and restyled, and has display options, but not hidden, rebuilt or
   *  replaced with HTML. */
  fixed?: boolean;
  /** Display choices this section offers (see OptionDef). */
  options?: OptionDef[];
};
export type CustomSection = { name: string; html: string; css: string };
export type SectionStyle = {
  bg?: string;
  /** Extra space above / below, in rem (0–8). */
  padTop?: number;
  padBottom?: number;
  hideOn?: "mobile" | "desktop";
  /** Text colour for everything in the section. */
  color?: string;
  align?: "left" | "center" | "right";
  /** Content max width in rem (20–100); centred. */
  maxWidth?: number;
  bgImage?: string;
  bgPositionX?: number;
  bgPositionY?: number;
  bgFit?: "cover" | "contain" | "custom";
  /** Background width in percent when custom sizing is selected (10–300). */
  bgScale?: number;
  bgRepeat?: "no-repeat" | "repeat" | "repeat-x" | "repeat-y";
  padInline?: number;
  radius?: number;
  borderTop?: boolean;
  borderBottom?: boolean;
  /** Advanced: CSS scoped to this section (it can target the section's own
   *  classes, e.g. `.shelf-heading { … }`). */
  css?: string;
  /** Two-colour gradient background (used when there is no background image). */
  gradFrom?: string;
  gradTo?: string;
  /** Gradient angle in degrees (0–360). */
  gradAngle?: number;
  /** The background image stays still while the page scrolls over it. */
  parallax?: boolean;
  /** A looping, muted video behind the content: a /path or https:// .mp4/.webm. */
  bgVideo?: string;
  /** A soft colour laid over the background (image, gradient or video). */
  overlayColor?: string;
  /** Overlay strength, percent (0–100). */
  overlayStrength?: number;
  /** The overlay fades out from one side (a veil behind the text) instead of
   *  covering everything evenly. */
  overlayFade?: "left" | "right" | "top" | "bottom";
  /** The band is at least this share of the screen's height (30–100), its
   *  content centred in it: a full-screen hero. */
  minHeight?: number;
  /** Entrance animation when the section scrolls into view. */
  anim?: SectionAnim;
  animSpeed?: "fast" | "normal" | "slow";
  /** Delay before the animation starts, ms (0–2000). */
  animDelay?: number;
};

/** One choice a section offers in Admin > Page layout > (section) > Options. A
 *  "toggle" shows or hides a part (stored as "off" when hidden); a "choice"
 *  picks one of a few looks (the first is the default). Applied as data-opt-*
 *  attributes on the section, which the page's CSS reacts to, so a change shows
 *  in the live preview at once. */
export type OptionDef =
  | { key: string; label: string; hint?: string; type: "toggle" }
  | {
      key: string;
      label: string;
      hint?: string;
      type: "choice";
      choices: { value: string; label: string }[];
    };

export const PRODUCT_TOP_OPTIONS: OptionDef[] = [
  {
    key: "gallery",
    label: "Photos on the",
    type: "choice",
    choices: [
      { value: "left", label: "Left" },
      { value: "right", label: "Right" },
    ],
  },
  {
    key: "titleSize",
    label: "Product title size",
    type: "choice",
    choices: [
      { value: "normal", label: "Normal" },
      { value: "large", label: "Large" },
      { value: "small", label: "Small" },
    ],
  },
  { key: "backLink", label: "Back link to the category", type: "toggle" },
  { key: "thumbs", label: "Photo thumbnails", type: "toggle" },
  { key: "valueRow", label: "Material and origin line", type: "toggle" },
  { key: "specs", label: "Size and colour lines", type: "toggle" },
  { key: "buyNow", label: '"Buy now" button', type: "toggle" },
  { key: "delivery", label: "Delivery estimate", type: "toggle" },
  { key: "shipTo", label: "Shipping cost by destination", type: "toggle" },
  { key: "trust", label: "Trust badges", type: "toggle" },
  { key: "payments", label: "Accepted payment marks", type: "toggle" },
];

/** Only known keys with allowed, non-default values survive. */
export function parseOptions(
  value: unknown,
  defs: OptionDef[] | undefined
): Record<string, string> | undefined {
  if (!defs || !value || typeof value !== "object") return undefined;
  const out: Record<string, string> = {};
  for (const def of defs) {
    const v = (value as Record<string, unknown>)[def.key];
    if (def.type === "toggle") {
      if (v === "off") out[def.key] = "off";
    } else if (typeof v === "string" && def.choices.slice(1).some((c) => c.value === v)) {
      out[def.key] = v;
    }
  }
  return Object.keys(out).length ? out : undefined;
}

export const SECTION_ANIMS = [
  "fade",
  "fade-up",
  "fade-down",
  "slide-left",
  "slide-right",
  "zoom",
  "shrink",
  "blur",
  "wipe",
  "rotate",
  "skew-rise",
  "flip",
] as const;
export type SectionAnim = (typeof SECTION_ANIMS)[number];
/** A section's place in the layout. `custom` is set on admin-written sections
 *  (ids "custom-xxxx"); `style` on any section. */
export type LayoutEntry = {
  id: string;
  visible: boolean;
  custom?: CustomSection;
  /** Built-in sections only: hand-edited HTML that replaces the section's
   *  own markup (a static snapshot: products and prices stop updating). */
  html?: string;
  /** Visual-builder design (see section-builder.ts). On a custom section it is
   *  the content; on a built-in section it replaces the section's own markup. */
  builder?: BuilderDoc;
  style?: SectionStyle;
  /** Display choices for sections that offer them (see SECTION_OPTIONS). */
  options?: Record<string, string>;
};

/**
 * Every way a Look row can be laid out.
 *
 * The first five are the treatments the page already shipped with. The six that
 * follow are the editorial templates — Editorial XXL, Botanical frame, Modern
 * collage, Graphic atelier, Asymmetric runway and Collector's edition — each a
 * complete composition of the SAME content (cover photo, the three numbered
 * pieces, eyebrow, title, rule, description, price, saving and CTA), differing
 * in grid, scale, overlap and ornament rather than in colour.
 *
 * Applied as `data-opt-lookStyle` on the section (see optionAttributes), which
 * look-editorial.css reacts to, so a change shows in the live preview at once.
 * "editorial" is first and therefore the default: the layout the page shipped
 * with, so nothing changes until the admin picks something else.
 */
export const LOOK_STYLE_OPTION: OptionDef = {
  key: "lookStyle",
  label: "Look row style",
  hint: "How each matching set is laid out",
  type: "choice",
  choices: [
    { value: "editorial", label: "Editorial (photo left, copy right)" },
    { value: "alternating", label: "Alternating (side flips each row)" },
    { value: "stacked", label: "Stacked (copy over a wide photo)" },
    { value: "minimal", label: "Minimal (photo above a quiet caption)" },
    { value: "framed", label: "Framed (copy in a panel beside the photo)" },
    { value: "xxl", label: "Editorial XXL (giant title, necklace through it)" },
    { value: "botanical", label: "Botanical frame (branches, open ovals)" },
    { value: "collage", label: "Modern collage (offset cream & ruby panels)" },
    { value: "atelier", label: "Quiet Atelier (ivory, cream rails, precise alignment)" },
    { value: "runway", label: "Asymmetric runway (huge necklace, offset title)" },
    { value: "collector", label: "Gallery (ordered product plates and captions)" },
    { value: "botanical-atelier", label: "Botanical Atelier (leaf panel, oversized serif)" },
    { value: "forest-editorial", label: "Forest Editorial (dark botanical panel, ivory plates)" },
    { value: "botanical-cutout", label: "Botanical Cutout (leaf corners, pale oval)" },
    { value: "couture-collage", label: "Couture Collage (layered paper panels)" },
    ...BOLD_TEMPLATE_IDS.map((id) => ({ value: id, label: EDITORIAL_TEMPLATE_META[id].name })),
  ],
};

export const LOOK_ACCENT_OPTION: OptionDef = {
  key: "lookAccent",
  label: "Accent tone",
  hint: "The colour used for the small highlights and rules",
  type: "choice",
  choices: [
    { value: "default", label: "Default" },
    { value: "sage", label: "Sage" },
    { value: "gold", label: "Gold" },
    { value: "rose", label: "Rose" },
    { value: "midnight", label: "Midnight" },
  ],
};

export const LOOK_DENSITY_OPTION: OptionDef = {
  key: "lookDensity",
  label: "Spacing density",
  hint: "Tighter or airier spacing around the text and image",
  type: "choice",
  choices: [
    { value: "default", label: "Default" },
    { value: "airy", label: "Airy" },
    { value: "compact", label: "Compact" },
  ],
};

export const LOOK_TEXT_ALIGN_OPTION: OptionDef = {
  key: "lookTextAlign",
  label: "Text alignment",
  hint: "How the description and price area sits in the row",
  type: "choice",
  choices: [
    { value: "default", label: "Default" },
    { value: "center", label: "Center" },
    { value: "left", label: "Left" },
  ],
};

export const LOOK_CTA_OPTION: OptionDef = {
  key: "lookCta",
  label: "CTA treatment",
  hint: "The visual emphasis of the call to action button",
  type: "choice",
  choices: [
    { value: "default", label: "Default" },
    { value: "subtle", label: "Subtle link" },
    { value: "bold", label: "Bold button" },
  ],
};

export const LOOK_OPTIONS = [
  LOOK_STYLE_OPTION,
  LOOK_ACCENT_OPTION,
  LOOK_DENSITY_OPTION,
  LOOK_TEXT_ALIGN_OPTION,
  LOOK_CTA_OPTION,
] as const;

/** Home page sections, top to bottom. The hero and the collections showcase
 *  come first like they always did, but are ordinary sections now: they can be
 *  hidden, restyled, replaced with a design or edited as HTML. */
export const HOME_SECTIONS = [
  { id: "hero", label: "Hero (top banner)", hint: "Film, store name, tagline and main button" },
  {
    id: "showcase",
    label: "Collections showcase",
    hint: "Seven compositions or a simple row, with editable collection text, photos and buttons",
  },
  { id: "popular", label: "Community favourites", hint: "Carousel of pinned or popular pieces" },
  { id: "bestSellers", label: "Best sellers", hint: "Top-selling pieces shelf" },
  {
    id: "looks",
    label: "Looks",
    hint: "Editorial matching sets",
    options: [...LOOK_OPTIONS],
  },
  { id: "newArrivals", label: "New arrivals", hint: "Latest products" },
  { id: "special", label: "Special selection", hint: "Hand-picked offers" },
  { id: "reasons", label: "Why Murano", hint: "Three reasons with pieces" },
  { id: "faq", label: "FAQ", hint: "Shipping, returns, care" },
  { id: "giftFinder", label: "Gift finder banner", hint: "Call to action to the gift finder" },
  { id: "testimonials", label: "Customer reviews", hint: "Real reviews only" },
  { id: "journal", label: "Journal", hint: "Latest blog articles" },
  { id: "newsletter", label: "Newsletter", hint: "Signup with discount" },
] as const satisfies readonly SectionMeta[];

/** Product page sections below the fixed gallery + buy box. */
export const PRODUCT_SECTIONS = [
  {
    id: "top",
    label: "Photos and buy box",
    hint: "Gallery, title, price, quantity and the buy buttons",
    fixed: true,
    options: PRODUCT_TOP_OPTIONS,
  },
  { id: "gift", label: "Gift packaging", hint: "Gift box photo and features" },
  { id: "reviews", label: "Reviews", hint: "Customer reviews and form" },
  { id: "customBlocks", label: "Custom blocks", hint: "Extra text written per product" },
  { id: "story", label: "Story & FAQ", hint: "Why this piece, and questions" },
  { id: "articles", label: "Related articles", hint: "Journal articles that feature this piece" },
  { id: "look", label: "Complete the look", hint: "Matching set pieces" },
  { id: "giftCard", label: "Gift card ad", hint: "Personalised gift card promo" },
  { id: "related", label: "You might also like", hint: "Related products" },
] as const satisfies readonly SectionMeta[];

export type HomeSectionId = (typeof HOME_SECTIONS)[number]["id"];
/** Pages whose sections can be arranged, styled and added to in Admin >
 *  Settings > Page layout. Home and product pages are stored on StoreSettings;
 *  the rest in the PageLayout table. */
export const PAGE_TARGETS = [
  "home",
  "product",
  "about",
  "contact",
  "looks",
  "journal",
  "article",
  "category",
  "products",
] as const;
export type PageTarget = (typeof PAGE_TARGETS)[number];

export const PAGE_LABELS: Record<PageTarget, string> = {
  home: "Home page",
  product: "Product pages",
  about: "About us",
  contact: "Contact",
  looks: "Looks",
  journal: "Journal",
  article: "Article pages",
  category: "Category pages",
  products: "All products",
};

export const isPageTarget = (value: string): value is PageTarget =>
  (PAGE_TARGETS as readonly string[]).includes(value);

/** The built-in sections of the other pages. Each page's header and main
 *  content are sections, so your own sections can go above, between or below
 *  them, and the built-in ones can be hidden, restyled or rebuilt. */
export const ABOUT_SECTIONS = [
  {
    id: "hero",
    label: "Hero (photo and title)",
    hint: "The big heritage photo with the page title",
  },
  {
    id: "body",
    label: "Story, values and trust",
    hint: "Heritage text, values, why choose us, links",
  },
  { id: "art", label: "Gondola illustration", hint: "The drawing at the foot of the page" },
] as const satisfies readonly SectionMeta[];

export const CONTACT_SECTIONS = [
  { id: "head", label: "Title and intro", hint: "The page heading and first line" },
  { id: "form", label: "Contact details and form", hint: "Email, address and the message form" },
] as const satisfies readonly SectionMeta[];

export const LOOKS_SECTIONS = [
  { id: "head", label: "Title and intro", hint: "The page heading and introduction" },
  {
    id: "list",
    label: "Looks, compose and FAQ",
    hint: "Your looks, the compose-your-own promo, reasons and FAQ",
    // The same core layouts and tuning options the home page's Looks section
    // offers. The CSS is keyed on data-opt-* values, so one rule set serves
    // both pages.
    options: [...LOOK_OPTIONS],
  },
] as const satisfies readonly SectionMeta[];

export const JOURNAL_SECTIONS = [
  { id: "head", label: "Title and filters", hint: "The journal heading and category filters" },
  { id: "list", label: "Articles", hint: "The featured article and the article list" },
] as const satisfies readonly SectionMeta[];

export const ARTICLE_OPENING_OPTIONS: OptionDef[] = [
  {
    key: "articleOpening",
    label: "Title and hero layout",
    hint: "Classical and editorial compositions using the article's own title and photograph.",
    type: "choice",
    choices: [
      { value: "classic", label: "Classic — centred title above a wide photograph" },
      { value: "framed", label: "Classical frame — cream paper, fine rules and inset photograph" },
      { value: "split", label: "Editorial spread — title beside a tall photograph" },
      { value: "overlap", label: "Editorial overlap — title card layered over the photograph" },
      {
        value: "blended",
        label: "Blended headline — title crosses the photograph, without a card",
      },
      { value: "cover", label: "Magazine cover — oversized title on the photograph" },
      { value: "portrait", label: "Classical portrait — paper title beside a framed photograph" },
      { value: "masthead", label: "Editorial masthead — fine rules and a panoramic photograph" },
    ],
  },
];

export const ARTICLE_SECTIONS = [
  {
    id: "head",
    label: "Article title and hero",
    hint: "Title, main photograph and article details in one composition; choose from eight layouts in Options",
    options: ARTICLE_OPENING_OPTIONS,
  },
  {
    id: "body",
    label: "Article content",
    hint: "Introduction, full article, featured products and sources",
  },
  {
    id: "series",
    label: "Series navigation",
    hint: "Other episodes when the article belongs to a series",
  },
  { id: "related", label: "Related articles", hint: "Recommended articles to read next" },
] as const satisfies readonly SectionMeta[];

export const CATEGORY_SECTIONS = [
  {
    id: "head",
    label: "Title and description",
    hint: "The category heading, photo and description",
  },
  { id: "list", label: "Products", hint: "Filters and the product grid" },
] as const satisfies readonly SectionMeta[];

export const PRODUCTS_SECTIONS = [
  { id: "head", label: "Title and intro", hint: "The shop heading and first line" },
  { id: "list", label: "Filters and products", hint: "Search, filters and the product grid" },
] as const satisfies readonly SectionMeta[];

export const SECTIONS_BY_TARGET: Record<PageTarget, readonly SectionMeta[]> = {
  home: HOME_SECTIONS,
  product: PRODUCT_SECTIONS,
  about: ABOUT_SECTIONS,
  contact: CONTACT_SECTIONS,
  looks: LOOKS_SECTIONS,
  journal: JOURNAL_SECTIONS,
  article: ARTICLE_SECTIONS,
  category: CATEGORY_SECTIONS,
  products: PRODUCTS_SECTIONS,
};

/** Where each page can be seen, relative to the language prefix. `sample` pages
 *  (a category, a product) are filled in by the admin from the database. */
export const PREVIEW_PATHS: Record<PageTarget, string> = {
  home: "",
  product: "/products/{product}",
  about: "/about",
  contact: "/contact",
  looks: "/looks",
  journal: "/blog",
  article: "/blog/{article}",
  category: "/category/{category}",
  products: "/products",
};

export type ProductSectionId = (typeof PRODUCT_SECTIONS)[number]["id"];

export const defaultLayout = (sections: readonly SectionMeta[]): LayoutEntry[] =>
  sections.map((s) => ({ id: s.id, visible: true }));

export function parseStyle(value: unknown): SectionStyle | undefined {
  if (!value || typeof value !== "object") return undefined;
  const {
    bg,
    padTop,
    padBottom,
    hideOn,
    color,
    align,
    maxWidth,
    bgImage,
    bgPositionX,
    bgPositionY,
    bgFit,
    bgScale,
    bgRepeat,
    padInline,
    radius,
    borderTop,
    borderBottom,
    css,
    anim,
    animSpeed,
    animDelay,
    gradFrom,
    gradTo,
    gradAngle,
    parallax,
    bgVideo,
    overlayColor,
    overlayStrength,
    overlayFade,
    minHeight,
  } = value as Record<string, unknown>;
  const pad = (n: unknown) =>
    typeof n === "number" && Number.isFinite(n) ? Math.min(8, Math.max(0, n)) : undefined;
  const style: SectionStyle = {
    bg: safeColor(bg),
    padTop: pad(padTop),
    padBottom: pad(padBottom),
    hideOn: hideOn === "mobile" || hideOn === "desktop" ? hideOn : undefined,
    color: safeColor(color),
    align: align === "left" || align === "center" || align === "right" ? align : undefined,
    maxWidth:
      typeof maxWidth === "number" && Number.isFinite(maxWidth)
        ? Math.min(100, Math.max(20, maxWidth))
        : undefined,
    bgImage: safeImageUrl(bgImage),
    bgPositionX:
      typeof bgPositionX === "number" && Number.isFinite(bgPositionX)
        ? Math.min(100, Math.max(0, bgPositionX))
        : undefined,
    bgPositionY:
      typeof bgPositionY === "number" && Number.isFinite(bgPositionY)
        ? Math.min(100, Math.max(0, bgPositionY))
        : undefined,
    bgFit: bgFit === "cover" || bgFit === "contain" || bgFit === "custom" ? bgFit : undefined,
    bgScale:
      typeof bgScale === "number" && Number.isFinite(bgScale)
        ? Math.min(300, Math.max(10, bgScale))
        : undefined,
    bgRepeat:
      bgRepeat === "no-repeat" ||
      bgRepeat === "repeat" ||
      bgRepeat === "repeat-x" ||
      bgRepeat === "repeat-y"
        ? bgRepeat
        : undefined,
    padInline: pad(padInline),
    radius: pad(radius),
    borderTop: borderTop === true ? true : undefined,
    borderBottom: borderBottom === true ? true : undefined,
    css: typeof css === "string" && css.trim() ? css.slice(0, MAX_SECTION_CSS) : undefined,
    gradFrom: safeColor(gradFrom),
    gradTo: safeColor(gradTo),
    gradAngle:
      typeof gradAngle === "number" && Number.isFinite(gradAngle)
        ? Math.min(360, Math.max(0, Math.round(gradAngle)))
        : undefined,
    parallax: parallax === true ? true : undefined,
    bgVideo: safeVideoUrl(bgVideo),
    overlayColor: safeColor(overlayColor),
    overlayStrength:
      typeof overlayStrength === "number" && Number.isFinite(overlayStrength)
        ? Math.min(100, Math.max(0, Math.round(overlayStrength)))
        : undefined,
    overlayFade:
      overlayFade === "left" ||
      overlayFade === "right" ||
      overlayFade === "top" ||
      overlayFade === "bottom"
        ? overlayFade
        : undefined,
    minHeight:
      typeof minHeight === "number" && Number.isFinite(minHeight) && minHeight > 0
        ? Math.min(100, Math.max(30, Math.round(minHeight)))
        : undefined,
    anim: SECTION_ANIMS.find((a) => a === anim),
    animSpeed: animSpeed === "fast" || animSpeed === "slow" ? animSpeed : undefined,
    animDelay:
      typeof animDelay === "number" && Number.isFinite(animDelay) && animDelay > 0
        ? Math.min(2000, Math.round(animDelay))
        : undefined,
  };
  return Object.values(style).some((v) => v !== undefined) ? style : undefined;
}

function parseCustom(value: unknown): CustomSection | undefined {
  if (!value || typeof value !== "object") return undefined;
  const { name, html, css } = value as Record<string, unknown>;
  if (typeof html !== "string") return undefined;
  return {
    name: (typeof name === "string" ? name.trim() : "").slice(0, 60) || "Custom section",
    html: html.slice(0, MAX_CUSTOM_HTML),
    css: typeof css === "string" ? css.slice(0, MAX_CUSTOM_CSS) : "",
  };
}

/** Stored value (anything) + the known sections → a complete, valid layout.
 *  Admin-written "custom-…" sections are kept in place alongside the built-in ones. */
export function resolveLayout(stored: unknown, sections: readonly SectionMeta[]): LayoutEntry[] {
  const known = new Set(sections.map((s) => s.id));
  const seen = new Set<string>();
  const result: LayoutEntry[] = [];
  if (Array.isArray(stored)) {
    for (const item of stored) {
      if (!item || typeof item !== "object") continue;
      const { id, visible, custom, style, html, builder, options } = item as {
        id?: unknown;
        visible?: unknown;
        custom?: unknown;
        style?: unknown;
        html?: unknown;
        builder?: unknown;
        options?: unknown;
      };
      if (typeof id !== "string" || seen.has(id)) continue;
      const entry: LayoutEntry = { id, visible: visible !== false };
      if (CUSTOM_ID_RE.test(id)) {
        const parsed = parseCustom(custom);
        if (!parsed || result.filter((e) => e.custom).length >= MAX_CUSTOM_SECTIONS) continue;
        entry.custom = parsed;
      } else if (!known.has(id)) continue;
      else if (typeof html === "string" && html.trim()) {
        entry.html = html.slice(0, MAX_OVERRIDE_HTML);
      }
      const meta = sections.find((s) => s.id === id);
      if (meta?.fixed) {
        // A fixed section is always shown and is never rebuilt or replaced.
        entry.visible = true;
        delete entry.html;
      } else {
        const parsedBuilder = parseBuilder(builder);
        if (parsedBuilder) entry.builder = parsedBuilder;
      }
      const parsedOptions = parseOptions(options, meta?.options);
      if (parsedOptions) entry.options = parsedOptions;
      const parsedStyle = parseStyle(style);
      if (parsedStyle) entry.style = parsedStyle;
      seen.add(id);
      result.push(entry);
    }
  }
  // A section the stored list does not know yet (shipped after it was saved)
  // goes where it sits in the default order: right after the closest earlier
  // default section that is present, or first.
  sections.forEach((s, i) => {
    if (seen.has(s.id)) return;
    let at = 0;
    for (let j = i - 1; j >= 0; j--) {
      const prev = result.findIndex((e) => e.id === sections[j].id);
      if (prev >= 0) {
        at = prev + 1;
        break;
      }
    }
    result.splice(at, 0, { id: s.id, visible: true });
    seen.add(s.id);
  });
  return result;
}

/**
 * The home page's starting layout: the built-in order, with the five editorial
 * examples already placed so the admin can see them in context.
 *
 * Each example is an ordinary `custom-…` section, which means it is deleted
 * exactly like any other admin-written section (the ✕ on its editor, or
 * "Delete this section") and never comes back once removed: `resolveLayout`
 * only ever *appends missing built-in sections, so a stored layout that no
 * longer lists an example is respected as-is. Deleting one therefore also
 * stops it being re-seeded, without needing a separate "dismissed" flag.
 */
const EDITORIAL_SEED: { id: string; name: string; templateId: string }[] = [
  { id: "custom-manifesto", name: "Editorial · Manifesto band", templateId: "editorial-manifesto" },
  { id: "custom-spread", name: "Editorial · Story spread", templateId: "editorial-story-spread" },
  { id: "custom-numbers", name: "Editorial · House numbers", templateId: "editorial-numbers" },
  { id: "custom-quote", name: "Editorial · Pull quote", templateId: "editorial-pull-quote" },
  { id: "custom-feature", name: "Editorial · Feature shelf", templateId: "editorial-shelf" },
];

/** Where each example sits in the default order: right after this built-in section. */
const EDITORIAL_AFTER: Record<string, string> = {
  "custom-manifesto": "showcase",
  "custom-spread": "popular",
  "custom-numbers": "bestSellers",
  "custom-quote": "looks",
  "custom-feature": "special",
};

/**
 * Places the editorial examples into a home layout, each directly after the
 * built-in section named in EDITORIAL_AFTER.
 *
 * Called on the *rendered* layout, never on what is stored, so it is not a
 * migration. An example the admin deleted leaves a hidden tombstone in the
 * stored layout (see `isEditorialSeed`); that entry is present here, so the
 * example is not re-added. A layout that was never saved has no tombstones at
 * all, which is exactly where the examples should show up first.
 *
 * `make` supplies the section body (the builder design) so this module stays
 * free of the templates themselves — page-layout is pure and importable from
 * anywhere, page-templates is not.
 */
export function withEditorialExamples(
  layout: LayoutEntry[],
  make: (templateId: string) => { builder?: LayoutEntry["builder"]; style?: SectionStyle } | null
): LayoutEntry[] {
  const result: LayoutEntry[] = [];
  for (const entry of layout) {
    // A tombstone (hidden, no design) stays in the list but is not shown.
    if (entry.visible || entry.builder) result.push(entry);
    for (const seed of EDITORIAL_SEED) {
      if (EDITORIAL_AFTER[seed.id] !== entry.id) continue;
      if (layout.some((e) => e.id === seed.id)) continue;
      const body = make(seed.templateId);
      if (!body) continue;
      result.push({
        id: seed.id,
        visible: true,
        custom: { name: seed.name, html: "", css: "" },
        ...(body.builder ? { builder: body.builder } : {}),
        ...(body.style ? { style: body.style } : {}),
      });
    }
  }
  return result;
}

/** True for the ids `withEditorialExamples` seeds onto the home page. */
export const isEditorialSeed = (id: string) => EDITORIAL_SEED.some((s) => s.id === id);

/** The seed's display name, by id: used when a tombstone must be written for an
 *  example the stored layout never mentioned. */
export const EDITORIAL_SEED_NAMES: Record<string, string> = Object.fromEntries(
  EDITORIAL_SEED.map((s) => [s.id, s.name])
);

/** The entries to render, in order, skipping hidden ones (and any `extraHidden`). */
export function visibleEntries(
  stored: unknown,
  sections: readonly SectionMeta[],
  extraHidden: readonly string[] = []
): LayoutEntry[] {
  return resolveLayout(stored, sections).filter(
    (entry) => entry.visible && !extraHidden.includes(entry.id)
  );
}

/** The ids to render, in order, skipping hidden ones (and any `extraHidden`). */
export function visibleOrder(
  stored: unknown,
  sections: readonly SectionMeta[],
  extraHidden: readonly string[] = []
): string[] {
  return resolveLayout(stored, sections)
    .filter((entry) => entry.visible && !extraHidden.includes(entry.id))
    .map((entry) => entry.id);
}

export type CustomBlock = { title: string; body: string };
export type ProductPageLayout = { hidden: string[]; blocks: CustomBlock[] };

export const MAX_CUSTOM_BLOCKS = 6;
export const MAX_BLOCK_TITLE = 80;
export const MAX_BLOCK_BODY = 2000;

/** Per-product overrides from the JSON column; tolerant of null / bad shapes. */
export function parseProductPageLayout(value: unknown): ProductPageLayout {
  const empty: ProductPageLayout = { hidden: [], blocks: [] };
  if (!value || typeof value !== "object") return empty;
  const { hidden, blocks } = value as { hidden?: unknown; blocks?: unknown };
  const known = new Set<string>(
    PRODUCT_SECTIONS.filter((s) => !("fixed" in s && s.fixed)).map((s) => s.id)
  );
  return {
    hidden: Array.isArray(hidden)
      ? hidden.filter((id): id is string => typeof id === "string" && known.has(id))
      : [],
    blocks: Array.isArray(blocks)
      ? blocks
          .flatMap((b) => {
            if (!b || typeof b !== "object") return [];
            const { title, body } = b as { title?: unknown; body?: unknown };
            if (typeof title !== "string" || typeof body !== "string") return [];
            const t = title.trim().slice(0, MAX_BLOCK_TITLE);
            const text = body.trim().slice(0, MAX_BLOCK_BODY);
            return t || text ? [{ title: t, body: text }] : [];
          })
          .slice(0, MAX_CUSTOM_BLOCKS)
      : [],
  };
}

export type LayoutPreset = {
  id: string;
  name: string;
  description: string;
  /** Section ids in order; any section not listed is hidden. */
  order: string[];
};

/** One-click starting points in the editor. Not stored: applying one just fills
 *  the draft, which the admin can still tweak before saving. */
export const HOME_PRESETS: LayoutPreset[] = [
  {
    id: "classic",
    name: "Classic",
    description: "The built-in order, everything on.",
    order: HOME_SECTIONS.map((s) => s.id),
  },
  {
    id: "shop-first",
    name: "Shop first",
    description: "Products up front, storytelling after.",
    order: [
      "hero",
      "showcase",
      "newArrivals",
      "bestSellers",
      "popular",
      "special",
      "looks",
      "reasons",
      "testimonials",
      "faq",
      "newsletter",
    ],
  },
  {
    id: "story-first",
    name: "Story first",
    description: "Brand and trust before the shelves.",
    order: [
      "hero",
      "showcase",
      "reasons",
      "looks",
      "popular",
      "journal",
      "bestSellers",
      "newArrivals",
      "testimonials",
      "giftFinder",
      "faq",
      "newsletter",
    ],
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Short page: favourites, best sellers, newsletter.",
    order: ["hero", "showcase", "popular", "bestSellers", "newsletter"],
  },
];

export const PRODUCT_PRESETS: LayoutPreset[] = [
  {
    id: "classic",
    name: "Classic",
    description: "The built-in order, everything on.",
    order: PRODUCT_SECTIONS.map((s) => s.id),
  },
  {
    id: "conversion",
    name: "Conversion",
    description: "Reviews and story first, related products right after.",
    order: ["top", "reviews", "customBlocks", "story", "related", "look", "gift"],
  },
  {
    id: "gifting",
    name: "Gifting",
    description: "Lead with the gift box and gift card.",
    order: ["top", "gift", "giftCard", "customBlocks", "story", "reviews", "look", "related"],
  },
  {
    id: "lean",
    name: "Lean",
    description: "Only reviews and related products.",
    order: ["top", "reviews", "related"],
  },
];

/** Preset → full layout: its sections first, visible; the rest appended hidden. */
export function layoutFromPreset(
  preset: LayoutPreset,
  sections: readonly SectionMeta[],
  keep: LayoutEntry[] = []
): LayoutEntry[] {
  const listed = preset.order.filter((id) => sections.some((s) => s.id === id));
  const rest = sections.filter((s) => !listed.includes(s.id));
  return [
    ...listed.map((id) => ({ id, visible: true })),
    ...rest.map((s) => ({ id: s.id, visible: false })),
    // Admin-written sections survive a preset, after the built-in ones.
    ...keep.filter((e) => e.custom),
  ];
}
