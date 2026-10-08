/**
 * Block styles: one look per kind of section-builder block, set once in
 * Admin > Settings > Block styles and applied to every designed section.
 *
 * Every control is declared here with its type and range, so the saved JSON is
 * re-validated against this list on every read and write: a stored value can
 * only ever be a clamped number, a hex colour, known palette reference or one of the listed choices,
 * which is what makes it safe to print into a stylesheet.
 */

export type ThemeControl = {
  key: string;
  label: string;
  /** Builds the declarations (without braces) from the validated value. */
  css: (value: string) => string;
} & (
  | { kind: "color" }
  | { kind: "range"; min: number; max: number; step: number; unit: string }
  | { kind: "choice"; options: { value: string; label: string }[] }
);

export type ThemeGroup = {
  /** Builder block type this group belongs to. */
  type: string;
  label: string;
  hint?: string;
  /** Selector prefix; every rule is written as `html .bld <selector>`. */
  selector: string;
  controls: ThemeControl[];
};

const color = (key: string, label: string, css: (v: string) => string): ThemeControl => ({
  key,
  label,
  kind: "color",
  css,
});
const range = (
  key: string,
  label: string,
  min: number,
  max: number,
  step: number,
  unit: string,
  css: (v: string) => string
): ThemeControl => ({ key, label, kind: "range", min, max, step, unit, css });
const choice = (
  key: string,
  label: string,
  options: [string, string][],
  css: (v: string) => string
): ThemeControl => ({
  key,
  label,
  kind: "choice",
  options: options.map(([value, text]) => ({ value, label: text })),
  css,
});

const WEIGHTS: [string, string][] = [
  ["400", "Regular"],
  ["500", "Medium"],
  ["600", "Semi-bold"],
  ["700", "Bold"],
];
const SHADOW_CHOICES: [string, string][] = [
  ["none", "None"],
  ["0 4px 14px rgba(0,0,0,.12)", "Soft"],
  ["0 14px 34px rgba(0,0,0,.22)", "Strong"],
];

/* Each group's controls write ONE kind of declaration to ONE selector, so the
   generated sheet stays predictable and easy to read back in the page source. */
export const THEME_GROUPS: ThemeGroup[] = [
  {
    type: "heading",
    label: "Heading",
    selector: ".bld-h",
    controls: [
      color("color", "Colour", (v) => `color:${v}`),
      choice("weight", "Weight", WEIGHTS, (v) => `font-weight:${v}`),
      range("tracking", "Letter spacing", -0.03, 0.2, 0.01, "em", (v) => `letter-spacing:${v}em`),
      range("lineHeight", "Line height", 0.9, 1.6, 0.05, "", (v) => `line-height:${v}`),
    ],
  },
  {
    type: "text",
    label: "Text",
    selector: ".bld-text",
    controls: [
      color("color", "Colour", (v) => `color:${v}`),
      range("size", "Size", 0.85, 1.5, 0.05, "em", (v) => `font-size:${v}em`),
      range("lineHeight", "Line height", 1.2, 2.2, 0.05, "", (v) => `line-height:${v}`),
    ],
  },
  {
    type: "image",
    label: "Image",
    selector: ".bld-img",
    controls: [
      range("radius", "Corner roundness", 0, 3, 0.25, "rem", (v) => `border-radius:${v}rem`),
      choice("shadow", "Shadow", SHADOW_CHOICES, (v) => `box-shadow:${v}`),
    ],
  },
  {
    type: "button",
    label: "Button",
    selector: ".bld-btn",
    controls: [
      range("radius", "Corner roundness", 0, 3, 0.25, "rem", (v) => `border-radius:${v}rem`),
      range("padY", "Height padding", 0.4, 1.6, 0.1, "rem", (v) => `padding-block:${v}rem`),
      range("padX", "Side padding", 0.8, 3.5, 0.1, "rem", (v) => `padding-inline:${v}rem`),
      choice("weight", "Weight", WEIGHTS, (v) => `font-weight:${v}`),
      choice(
        "caps",
        "Letters",
        [
          ["none", "Normal"],
          ["uppercase", "UPPERCASE"],
        ],
        (v) => `text-transform:${v}`
      ),
      range("tracking", "Letter spacing", 0, 0.25, 0.01, "em", (v) => `letter-spacing:${v}em`),
    ],
  },
  {
    type: "button",
    label: "Button · filled",
    selector: ".bld-btn-solid",
    controls: [
      color("bg", "Background", (v) => `background:${v}`),
      color("fg", "Text", (v) => `color:${v}`),
      color("border", "Border", (v) => `border-color:${v}`),
    ],
  },
  {
    type: "button",
    label: "Button · outline",
    selector: ".bld-btn-outline",
    controls: [
      color("fg", "Text and border", (v) => `color:${v};border-color:${v}`),
      range("border", "Border thickness", 1, 4, 1, "px", (v) => `border-width:${v}px`),
    ],
  },
  {
    type: "divider",
    label: "Line · horizontal",
    selector: ".bld-hr",
    controls: [
      color("color", "Colour", (v) => `border-top-color:${v}`),
      range("thickness", "Thickness", 1, 8, 1, "px", (v) => `border-top-width:${v}px`),
      range("opacity", "Strength", 0.1, 1, 0.05, "", (v) => `opacity:${v}`),
    ],
  },
  {
    type: "vline",
    label: "Line · vertical",
    selector: ".bld-vline",
    controls: [
      color("color", "Colour", (v) => `border-inline-start-color:${v}`),
      range("thickness", "Thickness", 1, 8, 1, "px", (v) => `border-inline-start-width:${v}px`),
      range("opacity", "Strength", 0.1, 1, 0.05, "", (v) => `opacity:${v}`),
    ],
  },
  {
    type: "list",
    label: "List",
    selector: ".bld-list",
    controls: [
      color("color", "Text colour", (v) => `color:${v}`),
      range("lineHeight", "Line height", 1.2, 2.4, 0.1, "", (v) => `line-height:${v}`),
    ],
  },
  {
    type: "quote",
    label: "Quote",
    selector: ".bld-quote",
    controls: [
      color("bar", "Bar colour", (v) => `border-inline-start-color:${v}`),
      range("barWidth", "Bar thickness", 0, 10, 1, "px", (v) => `border-inline-start-width:${v}px`),
      range("size", "Size", 1, 2, 0.05, "em", (v) => `font-size:${v}em`),
      choice(
        "style",
        "Style",
        [
          ["normal", "Upright"],
          ["italic", "Italic"],
        ],
        (v) => `font-style:${v}`
      ),
    ],
  },
  {
    type: "video",
    label: "Video and map",
    selector: ".bld-video,.bld-map,.bld-video-file",
    controls: [
      range("radius", "Corner roundness", 0, 3, 0.25, "rem", (v) => `border-radius:${v}rem`),
      choice("shadow", "Shadow", SHADOW_CHOICES, (v) => `box-shadow:${v}`),
    ],
  },
  {
    type: "counter",
    label: "Counter · number",
    selector: ".bld-count",
    controls: [
      color("color", "Colour", (v) => `color:${v}`),
      choice("weight", "Weight", WEIGHTS, (v) => `font-weight:${v}`),
    ],
  },
  {
    type: "counter",
    label: "Counter · label",
    selector: ".bld-count-label",
    controls: [
      color("color", "Colour", (v) => `color:${v}`),
      range("opacity", "Strength", 0.3, 1, 0.05, "", (v) => `opacity:${v}`),
    ],
  },
  {
    type: "icon",
    label: "Icon and text",
    selector: ".bld-icon-svg",
    controls: [
      color("color", "Icon colour", (v) => `color:${v}`),
      range("size", "Icon size", 0.8, 2, 0.1, "em", (v) => `font-size:${v}em`),
    ],
  },
  {
    type: "stars",
    label: "Review stars",
    selector: ".bld-stars",
    controls: [
      color(
        "color",
        "Star colour",
        (v) =>
          `background:linear-gradient(90deg,${v} calc(var(--r)/5*100%),rgba(0,0,0,.18) 0);-webkit-background-clip:text;background-clip:text`
      ),
      range("size", "Size", 1, 3, 0.1, "em", (v) => `font-size:${v}em`),
    ],
  },
  {
    type: "countdown",
    label: "Countdown",
    selector: ".bld-countdown",
    controls: [
      color("color", "Colour", (v) => `color:${v}`),
      range("size", "Size", 1, 3.5, 0.1, "em", (v) => `font-size:${v}em`),
      choice("weight", "Weight", WEIGHTS, (v) => `font-weight:${v}`),
    ],
  },
  {
    type: "badge",
    label: "Badge · filled",
    selector: ".bld-badge-solid",
    controls: [
      color("bg", "Background", (v) => `background:${v}`),
      color("fg", "Text", (v) => `color:${v}`),
    ],
  },
  {
    type: "badge",
    label: "Badge · all",
    selector: ".bld-badge",
    controls: [
      range("radius", "Corner roundness", 0, 1.5, 0.1, "rem", (v) => `border-radius:${v}rem`),
      range("size", "Size", 0.6, 1.2, 0.05, "em", (v) => `font-size:${v}em`),
    ],
  },
  {
    type: "eyebrow",
    label: "Eyebrow label",
    selector: ".bld-eyebrow",
    controls: [
      color("color", "Colour", (v) => `color:${v}`),
      range("size", "Size", 0.6, 1.2, 0.05, "em", (v) => `font-size:${v}em`),
      range("tracking", "Letter spacing", 0, 0.4, 0.02, "em", (v) => `letter-spacing:${v}em`),
    ],
  },
  {
    type: "heading",
    label: "Heading underline",
    hint: "The short rule under headings that use one.",
    selector: ".bld-h-ul::after",
    controls: [
      color("color", "Colour", (v) => `background:${v}`),
      range("width", "Length", 1, 12, 0.5, "rem", (v) => `width:${v}rem`),
      range("thickness", "Thickness", 1, 6, 1, "px", (v) => `height:${v}px`),
    ],
  },
  {
    type: "faq",
    label: "FAQ (you write)",
    selector: ".bld-faq-item summary",
    controls: [
      color("color", "Question colour", (v) => `color:${v}`),
      choice("weight", "Question weight", WEIGHTS, (v) => `font-weight:${v}`),
      range("size", "Question size", 0.9, 1.5, 0.05, "em", (v) => `font-size:${v}em`),
    ],
  },
  {
    type: "faq",
    label: "FAQ · lines",
    selector: ".bld-faq,.bld-faq-item",
    controls: [color("color", "Line colour", (v) => `border-color:${v}`)],
  },
  {
    type: "reviews",
    label: "Customer reviews",
    hint: "Live block: shows your real reviews.",
    selector: ".shelf-quote",
    controls: [
      color("bg", "Card background", (v) => `background:${v}`),
      range("radius", "Corner roundness", 0, 2, 0.25, "rem", (v) => `border-radius:${v}rem`),
      range("pad", "Padding", 0, 3, 0.25, "rem", (v) => `padding:${v}rem`),
    ],
  },
  {
    type: "reviews",
    label: "Customer reviews · stars",
    selector: ".shelf-stars",
    controls: [color("color", "Star colour", (v) => `color:${v}`)],
  },
  {
    type: "shelf",
    label: "Product shelf",
    hint: "Live block: shows your real products.",
    selector: ".shelf-row img",
    controls: [
      range("radius", "Image roundness", 0, 2, 0.25, "rem", (v) => `border-radius:${v}rem`),
      choice("shadow", "Image shadow", SHADOW_CHOICES, (v) => `box-shadow:${v}`),
    ],
  },
  {
    type: "shelf",
    label: "Product shelf · add button",
    hint: "The round button that adds a product to the cart.",
    selector: ".shelf-quick",
    controls: [
      color("bg", "Background", (v) => `background:${v}`),
      color("fg", "Icon colour", (v) => `color:${v}`),
      range("size", "Size", 2, 4, 0.25, "rem", (v) => `width:${v}rem;height:${v}rem`),
      range("radius", "Corner roundness", 0, 2, 0.25, "rem", (v) => `border-radius:${v}rem`),
      choice("shadow", "Shadow", SHADOW_CHOICES, (v) => `box-shadow:${v}`),
    ],
  },
  {
    type: "carousel",
    label: "Product carousel · pictures",
    hint: "Live block: the sliding product cards.",
    selector: ".popular-card-media",
    controls: [
      range("radius", "Corner roundness", 0, 2, 0.25, "rem", (v) => `border-radius:${v}rem`),
      choice("shadow", "Shadow", SHADOW_CHOICES, (v) => `box-shadow:${v}`),
    ],
  },
  {
    type: "carousel",
    label: "Product carousel · arrows",
    selector: ".popular-btn",
    controls: [
      color("bg", "Background", (v) => `background:${v}`),
      color("fg", "Arrow colour", (v) => `color:${v}`),
      range("radius", "Corner roundness", 0, 2, 0.25, "rem", (v) => `border-radius:${v}rem`),
    ],
  },
  {
    type: "looks",
    label: "Looks · text",
    hint: "Live block: the editorial looks.",
    selector: ".look-editorial-title",
    controls: [
      color("color", "Title colour", (v) => `color:${v}`),
      choice("weight", "Title weight", WEIGHTS, (v) => `font-weight:${v}`),
    ],
  },
  {
    type: "looks",
    label: "Looks · price and picture",
    selector: ".look-editorial-price",
    controls: [color("color", "Price colour", (v) => `color:${v}`)],
  },
  {
    type: "looks",
    label: "Looks · picture shape",
    selector: ".look-editorial-visual",
    controls: [
      range("radius", "Corner roundness", 0, 2, 0.25, "rem", (v) => `border-radius:${v}rem`),
      choice("shadow", "Shadow", SHADOW_CHOICES, (v) => `box-shadow:${v}`),
    ],
  },
  {
    type: "newsletter",
    label: "Newsletter form · button",
    hint: "Live block: the sign-up form.",
    selector: ".footer-newsletter-row .btn-primary",
    controls: [
      color("bg", "Background", (v) => `background:${v}`),
      color("fg", "Text", (v) => `color:${v}`),
      range("radius", "Corner roundness", 0, 2, 0.25, "rem", (v) => `border-radius:${v}rem`),
    ],
  },
  {
    type: "newsletter",
    label: "Newsletter form · field",
    selector: ".footer-newsletter-row input",
    controls: [
      color("bg", "Background", (v) => `background:${v}`),
      color("border", "Border", (v) => `border-color:${v}`),
      range("radius", "Corner roundness", 0, 2, 0.25, "rem", (v) => `border-radius:${v}rem`),
    ],
  },
  {
    type: "journal",
    label: "Journal articles · cards",
    hint: "Live block: your latest articles.",
    selector: ".journal-preview-card",
    controls: [
      color("bg", "Background", (v) => `background:${v}`),
      range("radius", "Corner roundness", 0, 2, 0.25, "rem", (v) => `border-radius:${v}rem`),
      choice("shadow", "Shadow", SHADOW_CHOICES, (v) => `box-shadow:${v}`),
    ],
  },
  {
    type: "journal",
    label: "Journal articles · picture and label",
    selector: ".journal-preview-image",
    controls: [
      range("radius", "Picture roundness", 0, 2, 0.25, "rem", (v) => `border-radius:${v}rem`),
    ],
  },
  {
    type: "journal",
    label: "Journal articles · category label",
    selector: ".journal-preview-kicker",
    controls: [color("color", "Colour", (v) => `color:${v}`)],
  },
  {
    type: "siteFaq",
    label: "Site FAQ",
    hint: "Live block: your questions and answers.",
    selector: ".faq-title",
    controls: [
      color("color", "Title colour", (v) => `color:${v}`),
      choice("weight", "Title weight", WEIGHTS, (v) => `font-weight:${v}`),
    ],
  },
  {
    type: "siteFaq",
    label: "Site FAQ · small label",
    selector: ".faq-eyebrow",
    controls: [color("color", "Colour", (v) => `color:${v}`)],
  },
  {
    type: "showcase",
    label: "Collections (row)",
    hint: "Live block: your collection cards.",
    selector: ".bld-collection-card",
    controls: [
      range("radius", "Corner roundness", 0, 2, 0.25, "rem", (v) => `border-radius:${v}rem`),
      choice("shadow", "Shadow", SHADOW_CHOICES, (v) => `box-shadow:${v}`),
    ],
  },
];

export type BlockTheme = Record<string, Record<string, string>>;

const PALETTE_REF =
  /^var\(--site-(?:bg|surface|text|text-muted|primary|on-primary|accent|border)\)$/;
const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const groupKey = (group: ThemeGroup) => `${group.type}|${group.selector}`;
export const themeGroupId = groupKey;

/** Keeps only values that every control accepts; clamps numbers to range. */
export function parseBlockTheme(raw: unknown): BlockTheme {
  const out: BlockTheme = {};
  if (!raw || typeof raw !== "object") return out;
  for (const group of THEME_GROUPS) {
    const saved = (raw as Record<string, unknown>)[groupKey(group)];
    if (!saved || typeof saved !== "object") continue;
    for (const control of group.controls) {
      const value = (saved as Record<string, unknown>)[control.key];
      const clean = cleanValue(control, value);
      if (clean !== null) (out[groupKey(group)] ??= {})[control.key] = clean;
    }
  }
  return out;
}

function cleanValue(control: ThemeControl, value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const text = String(value).trim();
  if (control.kind === "color") return HEX.test(text) || PALETTE_REF.test(text) ? text : null;
  if (control.kind === "choice") return control.options.some((o) => o.value === text) ? text : null;
  const n = Number(text);
  if (!Number.isFinite(n)) return null;
  const clamped = Math.min(control.max, Math.max(control.min, n));
  return String(Math.round(clamped * 1000) / 1000);
}

/** The stylesheet for a theme. `html .bld …` outranks the builder's own
 *  `.layout-sec-x .bld-…` defaults, while per-block inline styles still win. */
export function blockThemeCss(theme: BlockTheme, prefix = "html .bld"): string {
  const rules: string[] = [];
  for (const group of THEME_GROUPS) {
    const values = theme[groupKey(group)];
    if (!values) continue;
    const decls = group.controls
      .filter((c) => values[c.key] !== undefined)
      .map((c) => c.css(values[c.key]))
      .join(";");
    if (!decls) continue;
    const selector = group.selector
      .split(",")
      .map((s) => `${prefix} ${s.trim()}`)
      .join(",");
    rules.push(`${selector}{${decls}}`);
  }
  return rules.join("\n");
}
