import { videoEmbedUrl } from "@/lib/journal/article-schema";
import { safeColor, safeImageUrl, safeVideoUrl } from "@/lib/custom-section";
import type { SectionStyle } from "@/lib/page-layout";
import { parseTranslations, type BlockTranslations } from "@/lib/builder-i18n";
import {
  SHOWCASE_SCENES,
  parseSceneOverride,
  parseShowcaseScroll,
  type ShowcaseSceneOverride,
  type ShowcaseScroll,
} from "@/lib/showcase-options";

/**
 * The visual builder behind Admin > Settings > Page layout > (a section).
 * A section is a row of 1–4 columns; each column stacks blocks. The document is
 * stored as data and compiled to HTML + CSS here, so it can be edited again
 * later and can never contain anything but these blocks. Pure (no DOM, no
 * React): used by the editor, the live preview and the storefront.
 */

export type Align = "left" | "center" | "right";

export const CAROUSEL_SOURCES = ["popular", "bestSellers", "newest", "special"] as const;
export type CarouselSource = (typeof CAROUSEL_SOURCES)[number];
/** Where a product block takes its pieces from. */
export type ProductSource = CarouselSource;
export type ShowcaseScene = "necklace" | "bracelet" | "earrings";

/** The decorative shapes an admin can drop in and drag around. Kept as data so
 *  the editor's picker, the parser and the renderer all read one list. */
export const SHAPE_KINDS = [
  "rectangle",
  "oval",
  "triangle",
  "diamond",
  "star",
  "hexagon",
  "heart",
  "arrow",
  "blob",
  "cross",
  "ring",
  "speech",
] as const;
export type ShapeKind = (typeof SHAPE_KINDS)[number];
export const SHAPE_LABELS: Record<ShapeKind, string> = {
  rectangle: "Rectangle / square",
  oval: "Oval / circle",
  triangle: "Triangle",
  diamond: "Diamond",
  star: "Star",
  hexagon: "Hexagon",
  heart: "Heart",
  arrow: "Arrow",
  blob: "Soft blob",
  cross: "Cross / plus",
  ring: "Ring (outline circle)",
  speech: "Speech bubble",
};

export type HeadingRule = "gold" | "accent" | "thick";
export const HEADING_RULES: HeadingRule[] = ["gold", "accent", "thick"];

export const TYPING_SPEEDS = ["slow", "normal", "fast"] as const;
export type TypingSpeed = (typeof TYPING_SPEEDS)[number];

export type Effect = "lift" | "zoom" | "tilt" | "glow";
export const EFFECTS: Effect[] = ["lift", "zoom", "tilt", "glow"];

/** Scroll animations a block can play. Each is a function of one progress
 *  value (0 = hidden, 1 = shown) in layout-section.css, so the same animation
 *  can play once, replay when you scroll back, or follow the scroll position. */
export const MOTION_TYPES = [
  "fade",
  "rise",
  "drop",
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
export type MotionType = (typeof MOTION_TYPES)[number];
export const MOTION_LABELS: Record<MotionType, string> = {
  fade: "Fade in",
  rise: "Rise up",
  drop: "Drop down",
  "slide-left": "Slide in from the left",
  "slide-right": "Slide in from the right",
  zoom: "Zoom in",
  shrink: "Shrink into place",
  blur: "Focus (unblur)",
  wipe: "Wipe open",
  rotate: "Turn in",
  "skew-rise": "Rise with a skew",
  flip: "Flip up",
};
export type Motion = {
  type: MotionType;
  /** once (default), toggle = plays again when you scroll back past it and
   *  leaves when you scroll back up, scrub = follows the scroll position. */
  mode?: "toggle" | "scrub";
  speed?: "fast" | "slow";
  /** Extra wait before it starts, ms (0–3000). */
  delay?: number;
  /** How the animation accelerates. */
  ease?: Ease;
  /** Place in the sequence (1–20): lower plays first; the same number plays
   *  together. Blocks without one follow reading order. */
  order?: number;
};

function parseMotion(value: unknown): Motion | undefined {
  if (!value || typeof value !== "object") return undefined;
  const v = value as Record<string, unknown>;
  const type = MOTION_TYPES.find((m) => m === v.type);
  if (!type) return undefined;
  return {
    type,
    mode: v.mode === "toggle" || v.mode === "scrub" ? v.mode : undefined,
    speed: v.speed === "fast" || v.speed === "slow" ? v.speed : undefined,
    delay:
      typeof v.delay === "number" && Number.isFinite(v.delay) && v.delay > 0
        ? Math.min(3000, Math.round(v.delay))
        : undefined,
    order:
      typeof v.order === "number" && Number.isFinite(v.order)
        ? Math.round(num(v.order, 1, 20, 1))
        : undefined,
    ease: EASES.find((e) => e === v.ease),
  };
}

const MOTION_SPEED = { fast: "0.4s", slow: "1.4s" } as const;

/** What the scroll script reads, and the class that hides the block until it
 *  runs. `order` falls back to reading order (`position`). */
export function motionParts(
  m: Motion,
  position: number
): { className: string; attrs: Record<string, string>; vars: string } {
  return {
    className: ` bld-an${m.mode === "scrub" ? " bld-scrub" : ""}`,
    attrs: {
      "data-bm": m.type,
      ...(m.mode ? { "data-bm-mode": m.mode } : {}),
      ...(m.delay ? { "data-bm-delay": String(m.delay) } : {}),
      "data-bm-order": String(m.order ?? 100 + position),
    },
    vars: [
      m.speed ? `--bm-dur:${MOTION_SPEED[m.speed]}` : "",
      m.ease && m.ease !== "smooth" ? `--bm-ease:${EASE_CSS[m.ease]}` : "",
    ]
      .filter(Boolean)
      .join(";"),
  };
}

/** Per-block look, without writing CSS. */
export type BlockStyle = {
  color?: string;
  bg?: string;
  /** A two-colour gradient painted behind the block (used when there is no
   *  background image). */
  gradFrom?: string;
  gradTo?: string;
  /** Gradient angle in degrees (0–360). */
  gradAngle?: number;
  /** A background image behind the block's content. */
  bgImage?: string;
  bgFit?: "cover" | "contain";
  /** A soft colour laid over the background (image or gradient). */
  overlayColor?: string;
  overlayStrength?: number;
  /** Block opacity, percent (0–100). */
  opacity?: number;
  /** Inner padding, rem (0–4). */
  pad?: number;
  /** Corner radius, rem (0–3). */
  radius?: number;
  shadow?: "soft" | "medium" | "strong";
  /** Width as a share of the column, % (10–200; over 100 grows past the column). Set by dragging in the canvas. */
  w?: number;
  /** Nudge sideways, % of the column (−60–60), and down, rem (−30–30): blocks
   *  can overlap. Set by dragging the move handle in the canvas. */
  x?: number;
  y?: number;
  /** Stacking order of overlapping blocks (−5–20). */
  z?: number;
  /** Height, rem (2–60): fixed for pictures and video, a minimum for the rest. */
  h?: number;
  /** Phone-only position and size (same units as x, y, w, h). */
  mx?: number;
  my?: number;
  mw?: number;
  mh?: number;
  /** Use the site's heading or body typeface for this block. */
  font?: "heading" | "body";
  /** Text size, percent of normal (50–400). */
  scale?: number;
};

/** Looping animations a block can play while it is on screen. */
export const IDLE_TYPES = ["float", "pulse", "sway", "spin", "shine"] as const;
export type IdleType = (typeof IDLE_TYPES)[number];
export const IDLE_LABELS: Record<IdleType, string> = {
  float: "Float up and down",
  pulse: "Gentle pulse",
  sway: "Sway side to side",
  spin: "Slow spin",
  shine: "Shimmer",
};

export const EASES = ["smooth", "snappy", "bounce", "elastic", "linear"] as const;
export type Ease = (typeof EASES)[number];
export const EASE_LABELS: Record<Ease, string> = {
  smooth: "Smooth",
  snappy: "Snappy",
  bounce: "Bounce",
  elastic: "Elastic",
  linear: "Linear",
};
const EASE_CSS: Record<Ease, string> = {
  smooth: "cubic-bezier(.2,.7,.2,1)",
  snappy: "cubic-bezier(.16,1,.3,1)",
  bounce: "cubic-bezier(.34,1.56,.64,1)",
  elastic: "cubic-bezier(.68,-.6,.32,1.6)",
  linear: "linear",
};

export const ICONS = [
  "gem",
  "truck",
  "shield",
  "heart",
  "star",
  "gift",
  "clock",
  "leaf",
  "sparkles",
  "check",
] as const;
export type IconName = (typeof ICONS)[number];

type BlockCore =
  | {
      type: "heading";
      text: string;
      size: "s" | "m" | "l" | "xl";
      align?: Align;
      /** A short gold rule under the heading. */
      rule?: HeadingRule;
      /** Types the heading out letter by letter when it scrolls into view. */
      typing?: TypingSpeed;
      /** The page's main title (one per page, for search engines and screen readers). */
      h1?: boolean;
    }
  | { type: "text"; text: string; align?: Align; typing?: TypingSpeed }
  | { type: "image"; src: string; alt: string; rounded?: boolean; fit?: "contain" | "cover" }
  | {
      type: "button";
      text: string;
      href: string;
      look: "solid" | "outline";
      align?: Align;
      /** Fades in once the typing animations above it have finished. */
      afterTyping?: boolean;
    }
  | { type: "divider"; draw?: boolean }
  | { type: "vline"; height: number; draw?: boolean }
  | { type: "spacer"; height: number }
  | { type: "shape"; kind: ShapeKind; fill: string; stroke?: string; rotate?: number }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "quote"; text: string; cite?: string }
  | { type: "video"; url: string }
  | {
      type: "counter";
      value: number;
      prefix?: string;
      suffix?: string;
      label?: string;
      size: "m" | "l" | "xl";
      align?: Align;
      /** Count up from 0 on scroll (default on). */
      countUp?: boolean;
    }
  | { type: "icon"; icon: IconName; title: string; text?: string; align?: Align }
  | { type: "stars"; rating: number; label?: string; align?: Align }
  | { type: "countdown"; until: string; doneText?: string; label?: string; align?: Align }
  | { type: "badge"; text: string; look: "solid" | "outline" | "soft"; align?: Align }
  | { type: "map"; query: string; height: number }
  | { type: "carousel"; source: CarouselSource; count: number }
  | { type: "shelf"; source: ProductSource; count: number }
  | { type: "looks"; count: number }
  | { type: "reviews"; count: number }
  | { type: "newsletter" }
  | { type: "journal" }
  | { type: "siteFaq" }
  | {
      type: "showcase";
      /** Per scene of the collections animation: text, link, picture and side
       *  (the site's own if empty). */
      scenes?: Partial<Record<ShowcaseScene, ShowcaseSceneOverride>>;
      /** How the scroll sequence behaves and looks. */
      scroll?: ShowcaseScroll;
      /** "scroll": the pinned scroll sequence (default). "row": three plain cards, no animation. */
      layout?: "row";
    }
  | { type: "faq"; items: { q: string; a: string }[] }
  | {
      /** An editorial row: a picture on one side, eyebrow, title, rule, text
       *  and a button on the other, with an optional card on the picture. */
      type: "story";
      eyebrow?: string;
      title: string;
      text: string;
      cta?: string;
      href?: string;
      src: string;
      alt: string;
      /** Which side the picture is on. */
      side: "left" | "right";
      /** The picture's shape. */
      ratio?: "portrait" | "square" | "landscape";
      /** Picture blended into the page (jewellery on white) instead of a photo. */
      blend?: boolean;
      /** A small card on the picture (shown on hover; always on phones). */
      cardTitle?: string;
      cardPrice?: string;
      cardCta?: string;
      cardHref?: string;
    }
  | {
      /** The section's own built-in content (products, forms, articles…),
       *  placed inside the design so everything around it can be changed. */
      type: "original";
    }
  | {
      type: "eyebrow";
      /** A small number before the label ("02"), shown with a slash. */
      number?: string;
      text: string;
      /** A hairline running out from the label. */
      line: "none" | "after" | "before" | "both";
      align?: Align;
    };

export type BuilderBlock = BlockCore & {
  style?: BlockStyle;
  effect?: Effect;
  /** Hide this block on phones or on computers. */
  hide?: "mobile" | "desktop";
  /** Scroll animation. */
  motion?: Motion;
  /** A looping animation while the block is on screen. */
  idle?: IdleType;
  /** Scroll parallax: moves against (−) or with (+) the scroll, % (−60–60). */
  parallax?: number;
  /** Stays in view while its column scrolls past. */
  sticky?: boolean;
  /** Editor only: can't be moved or resized in the canvas. */
  locked?: boolean;
  /** Editor only: hidden in the canvas (still on the site). */
  ghost?: boolean;
  /** Blocks with the same name are selected and moved together. */
  group?: string;
  /** Wording per language (used instead of the main text for that language). */
  tr?: BlockTranslations;
};

export type BuilderDoc = {
  columns: 1 | 2 | 3 | 4;
  /** Space between columns, in rem (0–6). */
  gap: number;
  /** The vertical line between columns. */
  divider: "none" | "thin" | "thick" | "dashed" | "dotted";
  dividerColor?: string;
  /** Vertical alignment of the columns' content. */
  valign: "top" | "center";
  /** The lines between columns draw themselves in on scroll. */
  drawLines?: boolean;
  /** Pause between the steps of an animation sequence, ms (0–1000, default 150). */
  stagger?: number;
  /** "full": the design spans the whole width of the page, edge to edge. */
  width?: "full";
  /** Relative column widths (one per column, 0.2–5), set by dragging the
   *  column edges in the canvas. Absent = equal columns. */
  widths?: number[];
  /** How the columns behave on phones. */
  mobile?: {
    /** Show the columns in reverse order. */
    reverse?: boolean;
    /** Column indexes (0-based) that are hidden on phones. */
    hide?: number[];
    /** Space between stacked columns, rem (0–6). */
    gap?: number;
    /** Text size on phones, percent of normal (60–140). */
    fontScale?: number;
  };
  cells: BuilderBlock[][];
};

export const MAX_BLOCKS_PER_COLUMN = 30;
const HEADING_SIZES = ["s", "m", "l", "xl"] as const;

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const num = (v: unknown, min: number, max: number, fallback: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
const align = (v: unknown): Align | undefined =>
  v === "left" || v === "center" || v === "right" ? v : undefined;

/** Links in text and buttons: site paths, https:// or mailto: only. */
export const safeLink = (href: string) => /^(\/(?!\/)|https:\/\/|mailto:)[^\s"'<>]*$/.test(href);

const signed = (v: unknown, min: number, max: number, scale: number) =>
  typeof v === "number" && Number.isFinite(v)
    ? Math.round(num(v, min, max, 0) * scale) / scale
    : undefined;

function parseBlockStyle(value: unknown): BlockStyle | undefined {
  if (!value || typeof value !== "object") return undefined;
  const v = value as Record<string, unknown>;
  const style: BlockStyle = {
    color: safeColor(v.color),
    bg: safeColor(v.bg),
    gradFrom: safeColor(v.gradFrom),
    gradTo: safeColor(v.gradTo),
    gradAngle:
      typeof v.gradAngle === "number" && Number.isFinite(v.gradAngle)
        ? Math.round(num(v.gradAngle, 0, 360, 0))
        : undefined,
    bgImage: safeImageUrl(v.bgImage),
    bgFit: v.bgFit === "contain" ? "contain" : v.bgFit === "cover" ? "cover" : undefined,
    overlayColor: safeColor(v.overlayColor),
    overlayStrength:
      typeof v.overlayStrength === "number" && Number.isFinite(v.overlayStrength)
        ? Math.round(num(v.overlayStrength, 0, 100, 40))
        : undefined,
    opacity:
      typeof v.opacity === "number" && Number.isFinite(v.opacity) && v.opacity !== 100
        ? Math.round(num(v.opacity, 0, 100, 100))
        : undefined,
    pad: typeof v.pad === "number" && Number.isFinite(v.pad) ? num(v.pad, 0, 4, 0) : undefined,
    radius:
      typeof v.radius === "number" && Number.isFinite(v.radius)
        ? num(v.radius, 0, 3, 0)
        : undefined,
    shadow:
      v.shadow === "soft" || v.shadow === "medium" || v.shadow === "strong" ? v.shadow : undefined,
    x:
      typeof v.x === "number" && Number.isFinite(v.x)
        ? Math.round(num(v.x, -60, 60, 0) * 10) / 10
        : undefined,
    y:
      typeof v.y === "number" && Number.isFinite(v.y)
        ? Math.round(num(v.y, -30, 30, 0) * 10) / 10
        : undefined,
    z:
      typeof v.z === "number" && Number.isFinite(v.z) ? Math.round(num(v.z, -5, 20, 0)) : undefined,
    mx: signed(v.mx, -60, 60, 10),
    my: signed(v.my, -30, 30, 10),
    mw:
      typeof v.mw === "number" && Number.isFinite(v.mw)
        ? Math.round(num(v.mw, 10, 200, 100) * 10) / 10
        : undefined,
    mh:
      typeof v.mh === "number" && Number.isFinite(v.mh)
        ? Math.round(num(v.mh, 2, 60, 10) * 10) / 10
        : undefined,
    font: v.font === "heading" || v.font === "body" ? v.font : undefined,
    scale:
      typeof v.scale === "number" && Number.isFinite(v.scale) && v.scale !== 100
        ? Math.round(num(v.scale, 50, 400, 100))
        : undefined,
    w:
      typeof v.w === "number" && Number.isFinite(v.w)
        ? Math.round(num(v.w, 10, 200, 100) * 10) / 10
        : undefined,
    h:
      typeof v.h === "number" && Number.isFinite(v.h)
        ? Math.round(num(v.h, 2, 60, 10) * 10) / 10
        : undefined,
  };
  return Object.values(style).some((x) => x !== undefined) ? style : undefined;
}

function parseBlock(value: unknown): BuilderBlock | null {
  const core = parseCore(value);
  if (!core) return null;
  const b = value as Record<string, unknown>;
  const style = parseBlockStyle(b.style);
  const effect = EFFECTS.find((e) => e === b.effect);
  const hide = b.hide === "mobile" || b.hide === "desktop" ? b.hide : undefined;
  const motion = parseMotion(b.motion);
  const idle = IDLE_TYPES.find((i) => i === b.idle);
  const parallax =
    typeof b.parallax === "number" && Number.isFinite(b.parallax) && b.parallax !== 0
      ? Math.round(num(b.parallax, -60, 60, 0))
      : undefined;
  const group = typeof b.group === "string" && /^[\w-]{1,16}$/.test(b.group) ? b.group : undefined;
  const tr = parseTranslations(core.type, b.tr);
  return {
    ...core,
    ...(tr && { tr }),
    ...(idle && { idle }),
    ...(parallax !== undefined && parallax !== 0 && { parallax }),
    ...(b.sticky === true && { sticky: true }),
    ...(b.locked === true && { locked: true }),
    ...(b.ghost === true && { ghost: true }),
    ...(group && { group }),
    ...(style && { style }),
    ...(effect && { effect }),
    ...(hide && { hide }),
    ...(motion && { motion }),
  };
}

function parseCore(value: unknown): BlockCore | null {
  if (!value || typeof value !== "object") return null;
  const b = value as Record<string, unknown>;
  switch (b.type) {
    case "heading":
      return {
        type: "heading",
        text: str(b.text, 300),
        size: HEADING_SIZES.includes(b.size as never) ? (b.size as "s") : "l",
        align: align(b.align),
        rule:
          HEADING_RULES.find((r) => r === b.rule) ?? (b.underline === true ? "gold" : undefined),
        typing: TYPING_SPEEDS.find((t) => t === b.typing),
        h1: b.h1 === true ? true : undefined,
      };
    case "text":
      return {
        type: "text",
        text: str(b.text, 4000),
        align: align(b.align),
        typing: TYPING_SPEEDS.find((t) => t === b.typing),
      };
    case "image":
      return {
        type: "image",
        src: str(b.src, 1000),
        alt: str(b.alt, 300),
        rounded: b.rounded === true ? true : undefined,
        fit: b.fit === "contain" || b.fit === "cover" ? b.fit : undefined,
      };
    case "button":
      return {
        type: "button",
        text: str(b.text, 80),
        href: str(b.href, 500),
        look: b.look === "outline" ? "outline" : "solid",
        align: align(b.align),
        afterTyping: b.afterTyping === true ? true : undefined,
      };
    case "divider":
      return { type: "divider", draw: b.draw === true ? true : undefined };
    case "vline":
      return {
        type: "vline",
        height: num(b.height, 1, 40, 6),
        draw: b.draw === true ? true : undefined,
      };
    case "shape":
      return {
        type: "shape",
        kind: SHAPE_KINDS.find((k) => k === b.kind) ?? "rectangle",
        fill: safeColor(b.fill) ?? "#154230",
        stroke: safeColor(b.stroke),
        rotate:
          typeof b.rotate === "number" && Number.isFinite(b.rotate)
            ? Math.round(num(b.rotate, -180, 180, 0))
            : undefined,
      };
    case "spacer":
      return { type: "spacer", height: num(b.height, 0.5, 12, 2) };
    case "list":
      return {
        type: "list",
        items: (Array.isArray(b.items) ? b.items : []).map((i) => str(i, 500)).slice(0, 40),
        ordered: b.ordered === true ? true : undefined,
      };
    case "quote":
      return { type: "quote", text: str(b.text, 1000), cite: str(b.cite, 200) || undefined };
    case "video":
      return { type: "video", url: str(b.url, 500) };
    case "counter":
      return {
        type: "counter",
        value: num(b.value, 0, 1_000_000_000, 0),
        prefix: str(b.prefix, 8) || undefined,
        suffix: str(b.suffix, 8) || undefined,
        label: str(b.label, 200) || undefined,
        size: b.size === "m" || b.size === "l" || b.size === "xl" ? b.size : "xl",
        align: align(b.align),
        countUp: b.countUp === false ? false : undefined,
      };
    case "icon":
      return {
        type: "icon",
        icon: ICONS.find((i) => i === b.icon) ?? "sparkles",
        title: str(b.title, 120),
        text: str(b.text, 600) || undefined,
        align: align(b.align),
      };
    case "stars":
      return {
        type: "stars",
        rating: Math.round(num(b.rating, 0, 5, 5) * 10) / 10,
        label: str(b.label, 200) || undefined,
        align: align(b.align),
      };
    case "countdown": {
      const until = str(b.until, 20);
      return {
        type: "countdown",
        until: /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(until) ? until : "",
        doneText: str(b.doneText, 120) || undefined,
        label: str(b.label, 200) || undefined,
        align: align(b.align),
      };
    }
    case "badge":
      return {
        type: "badge",
        text: str(b.text, 60),
        look: b.look === "outline" || b.look === "soft" ? b.look : "solid",
        align: align(b.align),
      };
    case "map":
      return { type: "map", query: str(b.query, 200), height: num(b.height, 8, 40, 20) };
    case "eyebrow":
      return {
        type: "eyebrow",
        number: str(b.number, 8) || undefined,
        text: str(b.text, 120),
        line: b.line === "none" || b.line === "both" || b.line === "before" ? b.line : "after",
        align: align(b.align),
      };
    case "shelf":
      return {
        type: "shelf",
        source: CAROUSEL_SOURCES.find((c) => c === b.source) ?? "bestSellers",
        count: Math.round(num(b.count, 2, 12, 4)),
      };
    case "looks":
      return { type: "looks", count: Math.round(num(b.count, 1, 6, 3)) };
    case "reviews":
      return { type: "reviews", count: Math.round(num(b.count, 1, 6, 3)) };
    case "newsletter":
      return { type: "newsletter" };
    case "journal":
      return { type: "journal" };
    case "siteFaq":
      return { type: "siteFaq" };
    case "showcase": {
      const raw = (b.scenes && typeof b.scenes === "object" ? b.scenes : {}) as Record<
        string,
        unknown
      >;
      const scenes: Partial<Record<ShowcaseScene, ShowcaseSceneOverride>> = {};
      for (const scene of SHOWCASE_SCENES) {
        const parsed = parseSceneOverride(raw[scene]);
        if (parsed) scenes[scene] = parsed;
      }
      return {
        type: "showcase",
        scenes: Object.keys(scenes).length ? scenes : undefined,
        scroll: parseShowcaseScroll(b.scroll),
        layout: b.layout === "row" ? "row" : undefined,
      };
    }
    case "story": {
      const href = str(b.href, 500).trim();
      const cardHref = str(b.cardHref, 500).trim();
      return {
        type: "story",
        eyebrow: str(b.eyebrow, 80) || undefined,
        title: str(b.title, 200),
        text: str(b.text, 2000),
        cta: str(b.cta, 60) || undefined,
        href: href && safeLink(href) ? href : undefined,
        src: safeImageUrl(b.src) ?? "",
        alt: str(b.alt, 300),
        side: b.side === "left" ? "left" : "right",
        ratio: b.ratio === "square" || b.ratio === "landscape" ? b.ratio : undefined,
        blend: b.blend === true ? true : undefined,
        cardTitle: str(b.cardTitle, 80) || undefined,
        cardPrice: str(b.cardPrice, 40) || undefined,
        cardCta: str(b.cardCta, 40) || undefined,
        cardHref: cardHref && safeLink(cardHref) ? cardHref : undefined,
      };
    }
    case "original":
      return { type: "original" };
    case "faq":
      return {
        type: "faq",
        items: (Array.isArray(b.items) ? b.items : [])
          .flatMap((i) => {
            if (!i || typeof i !== "object") return [];
            const { q, a } = i as Record<string, unknown>;
            return [{ q: str(q, 200), a: str(a, 2000) }];
          })
          .slice(0, 20),
      };
    case "carousel":
      return {
        type: "carousel",
        source: CAROUSEL_SOURCES.find((c) => c === b.source) ?? "popular",
        count: Math.round(num(b.count, 3, 10, 10)),
      };
    default:
      return null;
  }
}

function parseMobile(value: unknown, columns: number): BuilderDoc["mobile"] {
  if (!value || typeof value !== "object") return undefined;
  const m = value as Record<string, unknown>;
  const hide = (Array.isArray(m.hide) ? m.hide : [])
    .filter((i): i is number => Number.isInteger(i) && i >= 0 && i < columns)
    .filter((i, idx, all) => all.indexOf(i) === idx);
  const mobile = {
    reverse: m.reverse === true ? true : undefined,
    hide: hide.length ? hide : undefined,
    gap: typeof m.gap === "number" && Number.isFinite(m.gap) ? num(m.gap, 0, 6, 1) : undefined,
    fontScale:
      typeof m.fontScale === "number" && Number.isFinite(m.fontScale)
        ? Math.round(num(m.fontScale, 60, 140, 100))
        : undefined,
  };
  return Object.values(mobile).some((x) => x !== undefined) ? mobile : undefined;
}

/** Tolerant read of a stored document: bad blocks are dropped, numbers clamped. */
function parseWidths(value: unknown, columns: number): number[] | undefined {
  if (!Array.isArray(value) || value.length !== columns || columns < 2) return undefined;
  const widths = value.map((w) =>
    typeof w === "number" && Number.isFinite(w) ? Math.round(num(w, 0.2, 5, 1) * 100) / 100 : 1
  );
  return widths.every((w) => w === widths[0]) ? undefined : widths;
}

export function parseBuilder(value: unknown): BuilderDoc | undefined {
  if (!value || typeof value !== "object") return undefined;
  const v = value as Record<string, unknown>;
  const columns = ([1, 2, 3, 4] as const).find((c) => c === v.columns) ?? 1;
  const rawCells = Array.isArray(v.cells) ? v.cells : [];
  const cells = Array.from({ length: columns }, (_, i) =>
    (Array.isArray(rawCells[i]) ? (rawCells[i] as unknown[]) : [])
      .flatMap((b) => {
        const parsed = parseBlock(b);
        return parsed ? [parsed] : [];
      })
      .slice(0, MAX_BLOCKS_PER_COLUMN)
  );
  return {
    columns,
    gap: num(v.gap, 0, 6, 2),
    divider:
      (["none", "thin", "thick", "dashed", "dotted"] as const).find((d) => d === v.divider) ??
      "none",
    dividerColor: safeColor(v.dividerColor),
    valign: v.valign === "center" ? "center" : "top",
    drawLines: v.drawLines === true ? true : undefined,
    widths: parseWidths(v.widths, columns),
    width: v.width === "full" ? "full" : undefined,
    stagger:
      typeof v.stagger === "number" && Number.isFinite(v.stagger)
        ? Math.round(num(v.stagger, 0, 1000, 150))
        : undefined,
    mobile: parseMobile(v.mobile, columns),
    cells,
  };
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Plain text → safe HTML with **bold**, *italic* and [label](link). */
export function inlineHtml(text: string): string {
  return escapeHtml(text)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label: string, href: string) => {
      const url = href.replace(/&amp;/g, "&");
      return safeLink(url) ? `<a href="${escapeHtml(url)}">${label}</a>` : label;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*\s][^*]*)\*/g, "<em>$1</em>");
}

const paragraphs = (text: string) =>
  text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${inlineHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("\n");

const alignAttr = (a?: Align) => (a ? ` style="text-align:${a}"` : "");

const ICON_PATHS: Record<IconName, string> = {
  gem: '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3 8 9l4 12 4-12-3-6"/><path d="M2 9h20"/>',
  truck:
    '<path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  heart:
    '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  star: '<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1z"/>',
  gift: '<rect x="3" y="8" width="18" height="4"/><path d="M12 8v13"/><path d="M19 12v9H5v-9"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 4 13c0-6 7-10 16-10 0 9-4 17-9 17z"/><path d="M4 21c3-6 7-9 12-12"/>',
  sparkles:
    '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  check: '<circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/>',
};

const SHADOWS = {
  soft: "0 2px 10px rgba(0,0,0,.08)",
  medium: "0 8px 24px rgba(0,0,0,.14)",
  strong: "0 18px 44px rgba(0,0,0,.24)",
} as const;

/** Marks the text elements an admin can click to edit in the live canvas. */
const FIELD_MARKS: Record<string, [classPrefix: string, field: string][]> = {
  heading: [["shelf-heading bld-h", "text"]],
  text: [["bld-text", "text"]],
  button: [["bld-btn ", "text"]],
  badge: [["bld-badge ", "text"]],
  eyebrow: [
    ["bld-eyebrow-num", "number"],
    ["bld-eyebrow-label", "text"],
  ],
  icon: [
    ["bld-icon-title", "title"],
    ["bld-icon-text", "text"],
  ],
  counter: [["bld-count-label", "label"]],
  stars: [["bld-stars-label", "label"]],
  countdown: [["bld-countdown-label", "label"]],
};

function markFields(html: string, type: string): string {
  let out = html;
  for (const [prefix, field] of FIELD_MARKS[type] ?? []) {
    const at = out.indexOf(`class="${prefix}`);
    if (at < 0) continue;
    const tagStart = out.lastIndexOf("<", at);
    const nameEnd = out.indexOf(" ", tagStart);
    if (tagStart < 0 || nameEnd < 0 || nameEnd > at) continue;
    out = `${out.slice(0, nameEnd)} data-bi-field="${field}"${out.slice(nameEnd)}`;
  }
  if (type === "quote") out = out.replace("<p>", '<p data-bi-field="text">');
  return out;
}

const MEDIA_TYPES: string[] = ["image", "video", "map", "shape"];

/** Everything a block's wrapper (and, in the canvas, its frame) needs: the
 *  layout declarations (position, size, phone overrides), the look, classes and
 *  data attributes. Shared by the HTML and the React renderer. */
function blockFrame(block: BuilderBlock, position: number) {
  const st = block.style;
  const media = MEDIA_TYPES.includes(block.type);
  const hasPos =
    st &&
    (st.x !== undefined ||
      st.y !== undefined ||
      st.z !== undefined ||
      st.mx !== undefined ||
      st.my !== undefined);
  const layout: string[] = [];
  if (st?.w !== undefined)
    layout.push(`width:${st.w}%`, ...(st.w < 100 ? ["margin-inline:auto"] : []));
  if (hasPos)
    layout.push(
      "position:relative",
      `left:${st?.x ?? 0}%`,
      `top:${st?.y ?? 0}rem`,
      ...(st?.z !== undefined ? [`z-index:${st.z}`] : [])
    );
  if (st?.h !== undefined || block.type === "shape")
    layout.push(`${media ? "height" : "min-height"}:${st?.h ?? 8}rem`);
  if (st?.mx !== undefined) layout.push(`--mx:${st.mx}%`);
  if (st?.my !== undefined) layout.push(`--my:${st.my}rem`);
  if (st?.mw !== undefined) layout.push(`--mw:${st.mw}%`);
  if (st?.mh !== undefined) layout.push(`--mh:${st.mh}rem`);
  const layoutClass = [
    st && (st.x !== undefined || st.y !== undefined) ? "bld-moved" : "",
    st?.mx !== undefined ? "bld-mx" : "",
    st?.my !== undefined ? "bld-my" : "",
    st?.mw !== undefined ? "bld-mw" : "",
    st?.mh !== undefined ? "bld-mh" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const look: string[] = [];
  const hasLayer = !!st?.bgImage || !!(st?.gradFrom && st?.gradTo);
  if (st?.color) look.push(`color:${st.color}`);
  // With no image or gradient the plain colour keeps the `background` shorthand
  // (so a button's inline style stays exactly as before); otherwise it becomes a
  // background-color underneath the layer.
  if (st?.bg) look.push(`${hasLayer ? "background-color" : "background"}:${st.bg}`);
  if (st?.bgImage) {
    look.push(`background-image:url("${st.bgImage}")`);
    look.push(`background-size:${st.bgFit ?? "cover"}`);
    look.push("background-position:center");
    look.push("background-repeat:no-repeat");
  } else if (st?.gradFrom && st?.gradTo) {
    look.push(`background-image:linear-gradient(${st.gradAngle ?? 135}deg,${st.gradFrom},${st.gradTo})`);
  }
  if (st?.overlayColor && hasLayer)
    look.push(
      `background-image:linear-gradient(color-mix(in srgb,${st.overlayColor} ${st.overlayStrength ?? 40}%,transparent),color-mix(in srgb,${st.overlayColor} ${st.overlayStrength ?? 40}%,transparent))${st.bgImage ? `,url("${st.bgImage}")` : `,linear-gradient(${st.gradAngle ?? 135}deg,${st.gradFrom},${st.gradTo})`}`
    );
  if (st?.opacity !== undefined) look.push(`opacity:${st.opacity / 100}`);
  if (st?.pad !== undefined) look.push(`padding:${st.pad}rem`);
  if (st?.radius !== undefined) look.push(`border-radius:${st.radius}rem`);
  else if (block.type === "image" && block.rounded) look.push("border-radius:.75rem");
  if (st?.shadow) look.push(`box-shadow:${SHADOWS[st.shadow]}`);
  if (st?.font) look.push(`font-family:var(--font-${st.font})`);
  if (st?.scale) look.push(`font-size:${st.scale}%`);
  const motion = block.motion ? motionParts(block.motion, position) : null;
  const classes = [
    "bld-b",
    media ? "bld-media-frame" : "",
    block.effect ? `bld-fx bld-fx-${block.effect}` : "",
    block.hide ? `bld-hide-${block.hide}` : "",
    media && (st?.h !== undefined || st?.mh !== undefined || block.type === "shape")
      ? "bld-fit"
      : "",
    motion ? motion.className.trim() : "",
    block.idle ? `bld-idle bld-idle-${block.idle}` : "",
    block.parallax ? "bld-par" : "",
    block.sticky ? "bld-sticky" : "",
  ].filter(Boolean);
  const attrs: Record<string, string> = {
    ...motion?.attrs,
    ...(block.parallax ? { "data-bld-par": String(block.parallax) } : {}),
  };
  return { layout, layoutClass, look, classes, attrs, vars: motion?.vars ?? "", media };
}

const needsWrap = (block: BuilderBlock) =>
  !!(
    block.type === "shape" ||
    block.style ||
    block.effect ||
    block.hide ||
    block.motion ||
    block.idle ||
    block.parallax ||
    block.sticky
  );

/** One block, wrapped when it has its own style, effect or animation. In edit
 *  mode every block also gets a draggable frame carrying its position. */
export function blockHtml(block: BuilderBlock, edit = false, col = 0, idx = 0): string {
  let inner = coreHtml(block);
  const f = needsWrap(block) ? blockFrame(block, col * 25 + idx) : null;
  // Button appearance belongs to the clickable element, not its full-width row.
  if (block.type === "button" && f?.look.length)
    inner = inner.replace(/(<a class="bld-btn [^"]+")/, `$1 style="${f.look.join(";")}"`);
  if (edit) inner = inner ? markFields(inner, block.type) : "";
  const attr = (decls: string[]) => (decls.length ? ` style="${decls.join(";")}"` : "");
  if (inner && f) {
    const outerLook = block.type === "button" ? [] : f.look;
    const decls = edit
      ? [...(f.media && f.classes.includes("bld-fit") ? ["height:100%"] : []), ...outerLook]
      : [...f.layout, ...outerLook];
    if (f.vars) decls.unshift(f.vars);
    const cls = [...f.classes, ...(edit ? [] : f.layoutClass ? [f.layoutClass] : [])].join(" ");
    const attrsHtml = Object.entries(f.attrs)
      .map(([k, v]) => ` ${k}="${v}"`)
      .join("");
    inner = `<div class="${cls}"${attrsHtml}${attr(decls)}>\n${inner}\n</div>`;
  }
  if (!edit) return inner;
  const body = inner || `<div class="bld-empty">Empty ${BLOCK_NAMES[block.type]} block</div>`;
  const frameClass = [
    "bld-e",
    f?.layoutClass ?? "",
    block.locked ? "bld-locked" : "",
    block.ghost ? "bld-ghost" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return `<div class="${frameClass}" data-bi="${col}:${idx}" data-bt="${block.type}"${block.group ? ` data-grp="${block.group}"` : ""} draggable="${block.locked ? "false" : "true"}"${attr(f?.layout ?? [])}>\n${body}\n</div>`;
}

/** Blocks that show live site data (rendered by BuilderView on the site). */
export const LIVE_TYPES = [
  "carousel",
  "shelf",
  "looks",
  "reviews",
  "newsletter",
  "journal",
  "siteFaq",
  "showcase",
  "original",
] as const;
export type LiveType = (typeof LIVE_TYPES)[number];
export const isLiveBlock = (
  block: BuilderBlock
): block is Extract<BuilderBlock, { type: LiveType }> =>
  (LIVE_TYPES as readonly string[]).includes(block.type);
export const hasLiveBlocks = (doc: BuilderDoc) => doc.cells.some((cell) => cell.some(isLiveBlock));

const LIVE_LABELS: Record<LiveType, string> = {
  carousel: "Product carousel: your live products slide here",
  shelf: "Product shelf: your live products appear here",
  looks: "Looks: your live editorial looks appear here",
  reviews: "Customer reviews: real reviews appear here",
  newsletter: "Newsletter signup form",
  journal: "Journal: your latest articles appear here",
  siteFaq: "FAQ: the site's questions and answers appear here",
  showcase: "Collections animation: the scrolling necklace, bracelet and earrings sequence",
  original: "The section's own content (products, forms, articles…) appears here",
};

const BLOCK_NAMES: Record<BuilderBlock["type"], string> = {
  heading: "heading",
  text: "text",
  image: "image",
  button: "button",
  divider: "line",
  vline: "vertical line",
  spacer: "space",
  shape: "shape",
  list: "list",
  quote: "quote",
  video: "video",
  counter: "counter",
  icon: "icon",
  stars: "stars",
  countdown: "countdown",
  badge: "badge",
  map: "map",
  carousel: "product carousel",
  eyebrow: "eyebrow label",
  shelf: "product shelf",
  looks: "looks",
  reviews: "reviews",
  newsletter: "newsletter form",
  journal: "journal",
  siteFaq: "site FAQ",
  showcase: "collections animation",
  faq: "FAQ",
  story: "story row",
  original: "original content",
};

const fmtNumber = (n: number) => new Intl.NumberFormat("en-US").format(n);

function coreHtml(block: BlockCore): string {
  switch (block.type) {
    case "heading": {
      const tag = block.h1 ? "h1" : block.size === "s" ? "h4" : block.size === "m" ? "h3" : "h2";
      return `<${tag} class="shelf-heading bld-h bld-h-${block.size}${block.rule ? ` bld-h-ul bld-h-ul-${block.rule}` : ""}"${alignAttr(block.align)}${block.typing ? ` data-bld-type="${block.typing}"` : ""}>${inlineHtml(block.text)}</${tag}>`;
    }
    case "text":
      return block.text.trim()
        ? `<div class="bld-text"${alignAttr(block.align)}${block.typing ? ` data-bld-type="${block.typing}"` : ""}>\n${paragraphs(block.text)}\n</div>`
        : "";
    case "image": {
      const src = safeImageUrl(block.src);
      return src
        ? `<img class="bld-img${block.rounded ? " bld-round" : ""}" src="${escapeHtml(src)}" alt="${escapeHtml(block.alt)}"${block.fit ? ` style="object-fit:${block.fit}"` : ""} loading="lazy">`
        : "";
    }
    case "button":
      return block.text.trim() && safeLink(block.href)
        ? `<p class="bld-btn-row"${alignAttr(block.align)}${block.afterTyping ? " data-bld-after" : ""}><a class="bld-btn bld-btn-${block.look}" href="${escapeHtml(block.href)}">${inlineHtml(block.text).replace(/<\/?a\b[^>]*>/g, "")}</a></p>`
        : "";
    case "divider":
      return `<hr class="bld-hr"${block.draw ? " data-bld-draw" : ""}>`;
    case "vline":
      return `<div class="bld-vline" style="height:${block.height}rem" role="separator"${block.draw ? " data-bld-draw" : ""}></div>`;
    case "shape": {
      const fill = safeColor(block.fill) ?? "#154230";
      const stroke = safeColor(block.stroke);
      // Each kind is a clip-path (or, for the ring, a border-radius). `speech`
      // and `cross` need extra markup, so they are handled below.
      const clip: Record<ShapeKind, string> = {
        rectangle: "none",
        oval: "none",
        triangle: "polygon(50% 0,100% 100%,0 100%)",
        diamond: "polygon(50% 0,100% 50%,50% 100%,0 50%)",
        star: "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
        hexagon: "polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)",
        heart:
          "path('M12 21s-7.5-4.7-9.6-9.2C.6 8.3 2.3 4.5 6 4.5c2.2 0 3.7 1.2 6 3.4 2.3-2.2 3.8-3.4 6-3.4 3.7 0 5.4 3.8 3.6 7.3C19.5 16.3 12 21 12 21z')",
        arrow: "polygon(0 33%,60% 33%,60% 10%,100% 50%,60% 90%,60% 67%,0 67%)",
        blob: "polygon(30% 5%,65% 0,95% 25%,100% 60%,80% 95%,45% 100%,10% 90%,0 55%,5% 20%)",
        cross: "none",
        ring: "none",
        speech: "none",
      };
      const radius = block.kind === "oval" ? "50%" : block.kind === "ring" ? "50%" : "inherit";
      const style = [
        "width:100%",
        "height:100%",
        block.kind === "cross" || block.kind === "ring" ? "" : `background:${fill}`,
        block.kind === "ring" ? `border:${Math.max(2, 8)}px solid ${fill}` : "",
        block.kind === "cross"
          ? `background:linear-gradient(${fill},${fill}) center/34% 100% no-repeat,linear-gradient(${fill},${fill}) center/100% 34% no-repeat`
          : "",
        `border-radius:${radius}`,
        `clip-path:${clip[block.kind]}`,
        stroke ? `outline:2px solid ${stroke};outline-offset:-2px` : "",
        block.rotate ? `transform:rotate(${block.rotate}deg)` : "",
      ]
        .filter(Boolean)
        .join(";");
      return `<div class="bld-shape" aria-hidden="true" style="${style}"></div>`;
    }
    case "spacer":
      return `<div style="height:${block.height}rem" aria-hidden="true"></div>`;
    case "list": {
      const items = block.items.filter((i) => i.trim());
      if (items.length === 0) return "";
      const tag = block.ordered ? "ol" : "ul";
      return `<${tag} class="bld-list">\n${items.map((i) => `<li>${inlineHtml(i)}</li>`).join("\n")}\n</${tag}>`;
    }
    case "quote":
      return `<blockquote class="bld-quote">\n<p>${inlineHtml(block.text)}</p>${block.cite ? `\n<cite>${escapeHtml(block.cite)}</cite>` : ""}\n</blockquote>`;
    case "counter": {
      const size =
        block.size === "m" ? "bld-count-m" : block.size === "l" ? "bld-count-l" : "bld-count-xl";
      return `<div class="bld-counter"${alignAttr(block.align)}><span class="bld-count ${size} shelf-heading">${escapeHtml(block.prefix ?? "")}<span ${block.countUp === false ? "" : `data-bld-count="${block.value}"`}>${fmtNumber(block.value)}</span>${escapeHtml(block.suffix ?? "")}</span>${block.label ? `<span class="bld-count-label">${inlineHtml(block.label)}</span>` : ""}</div>`;
    }
    case "icon":
      return `<div class="bld-icon"${alignAttr(block.align)}><svg class="bld-icon-svg" viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[block.icon]}</svg><h3 class="bld-icon-title">${inlineHtml(block.title)}</h3>${block.text ? `<p class="bld-icon-text">${inlineHtml(block.text)}</p>` : ""}</div>`;
    case "stars":
      return `<div class="bld-stars-row"${alignAttr(block.align)}><span class="bld-stars" style="--r:${block.rating}" role="img" aria-label="${block.rating} out of 5">★★★★★</span>${block.label ? `<span class="bld-stars-label">${inlineHtml(block.label)}</span>` : ""}</div>`;
    case "countdown":
      return block.until
        ? `<div class="bld-countdown-wrap"${alignAttr(block.align)}>${block.label ? `<p class="bld-countdown-label">${inlineHtml(block.label)}</p>` : ""}<div class="bld-countdown" data-bld-countdown="${block.until}" data-done="${escapeHtml(block.doneText ?? "")}">${block.until.replace("T", " ")}</div></div>`
        : "";
    case "badge":
      return `<p class="bld-badge-row"${alignAttr(block.align)}><span class="bld-badge bld-badge-${block.look}">${inlineHtml(block.text)}</span></p>`;
    case "eyebrow": {
      const rule = `<span class="bld-eyebrow-rule" aria-hidden="true"></span>`;
      const where =
        block.align === "center"
          ? " bld-eyebrow-center"
          : block.align === "right"
            ? " bld-eyebrow-right"
            : "";
      return `<p class="bld-eyebrow${where}${block.line === "before" ? " bld-eyebrow-before" : ""}">${block.line === "both" || block.line === "before" ? rule : ""}${block.number ? `<span class="bld-eyebrow-num">${escapeHtml(block.number)}</span><span class="bld-eyebrow-sep" aria-hidden="true">/</span>` : ""}<span class="bld-eyebrow-label">${inlineHtml(block.text)}</span>${block.line === "after" || block.line === "both" ? rule : ""}</p>`;
    }
    case "carousel":
    case "shelf":
      return `<div class="bld-live" data-bld-live="${block.type}" data-bld-label="${LIVE_LABELS[block.type]}" data-source="${block.source}" data-count="${block.count}"></div>`;
    case "looks":
    case "reviews":
      return `<div class="bld-live" data-bld-live="${block.type}" data-bld-label="${LIVE_LABELS[block.type]}" data-count="${block.count}"></div>`;
    case "newsletter":
    case "journal":
    case "siteFaq":
    case "showcase":
    case "original":
      return `<div class="bld-live" data-bld-live="${block.type}" data-bld-label="${LIVE_LABELS[block.type]}"></div>`;
    case "story": {
      const ratio = block.ratio ?? "portrait";
      const link = block.href && safeLink(block.href) ? block.href : "";
      const cardLink = block.cardHref ?? link;
      const card =
        block.cardTitle || block.cardPrice
          ? `<figcaption class="bld-story-card">${block.cardTitle ? `<span class="bld-story-card-title">${inlineHtml(block.cardTitle)}</span>` : ""}${block.cardPrice ? `<span class="bld-story-card-price">${escapeHtml(block.cardPrice)}</span>` : ""}${cardLink && block.cardCta ? `<a class="bld-story-card-link" href="${escapeHtml(cardLink)}">${inlineHtml(block.cardCta)} <span aria-hidden="true">↗</span></a>` : ""}</figcaption>`
          : "";
      const img = block.src
        ? `<img class="bld-story-img" src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}" loading="lazy">`
        : `<span class="bld-story-empty">Add a picture</span>`;
      return `<article class="bld-story bld-story--img-${block.side}" data-ratio="${ratio}"${block.blend ? " data-blend" : ""}>
<div class="bld-story-copy">${block.eyebrow ? `<p class="bld-story-eyebrow">${inlineHtml(block.eyebrow)}</p>` : ""}<h2 class="shelf-heading bld-story-title">${inlineHtml(block.title)}</h2><span class="bld-story-rule" aria-hidden="true"></span>${block.text.trim() ? `<div class="bld-story-text">${paragraphs(block.text)}</div>` : ""}${block.cta && link ? `<a class="btn-primary btn-arrow bld-story-cta" href="${escapeHtml(link)}">${inlineHtml(block.cta)}<span class="btn-arrow-glyph" aria-hidden="true">→</span></a>` : ""}</div>
<figure class="bld-story-visual">${link ? `<a class="bld-story-media" href="${escapeHtml(link)}" tabindex="-1" aria-hidden="true">${img}</a>` : `<span class="bld-story-media">${img}</span>`}${card}</figure>
</article>`;
    }
    case "faq": {
      const items = block.items.filter((i) => i.q.trim() && i.a.trim());
      return items.length
        ? `<div class="bld-faq">\n${items.map((i) => `<details class="bld-faq-item"><summary>${inlineHtml(i.q)}</summary><div class="bld-faq-a">${paragraphs(i.a)}</div></details>`).join("\n")}\n</div>`
        : "";
    }
    case "map":
      return block.query.trim()
        ? `<iframe class="bld-map" data-h="${block.height}" src="https://www.google.com/maps?q=${encodeURIComponent(block.query.trim())}&amp;output=embed" loading="lazy"></iframe>`
        : "";
    case "video": {
      const src = videoEmbedUrl(block.url);
      if (src)
        return `<iframe class="bld-video" src="${src}" loading="lazy" allowfullscreen></iframe>`;
      // A video file (/path or https .mp4/.webm): plays muted and looping, no controls.
      const file = safeVideoUrl(block.url);
      return file
        ? `<video class="bld-video bld-video-file" src="${escapeHtml(file)}" autoplay muted loop playsinline preload="metadata"></video>`
        : "";
    }
  }
}

const RULE: Record<BuilderDoc["divider"], string> = {
  none: "",
  thin: "1px solid",
  thick: "3px solid",
  dashed: "1px dashed",
  dotted: "2px dotted",
};

function mobileCss(doc: BuilderDoc): string {
  const m = doc.mobile;
  if (!m) return "";
  const rules: string[] = [];
  if (m.gap !== undefined) rules.push(`.bld{gap:${m.gap}rem}`);
  if (m.fontScale !== undefined) rules.push(`.bld{font-size:${m.fontScale}%}`);
  if (m.reverse) rules.push(`.bld{display:flex;flex-direction:column-reverse}`);
  for (const i of m.hide ?? []) rules.push(`.bld-col:nth-child(${i + 1}){display:none}`);
  return rules.length ? `@media (max-width:47.99rem){${rules.join("")}}` : "";
}

/** The editorial story row: the site's own "why Murano" rows, as a block. */
const STORY_CSS = [
  `.bld-story{display:grid;align-items:center;gap:clamp(2rem,6vw,6rem);padding-block:clamp(2.5rem,6vw,5rem);max-width:72rem;margin-inline:auto}`,
  `.bld-story--img-right{grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);grid-template-areas:"copy visual"}`,
  `.bld-story--img-left{grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);grid-template-areas:"visual copy"}`,
  `.bld-story-copy{grid-area:copy;display:flex;flex-direction:column;align-items:flex-start;min-width:0;max-width:31rem}`,
  `.bld-story--img-right .bld-story-copy{padding-inline-end:clamp(0rem,3vw,3rem)}.bld-story--img-left .bld-story-copy{padding-inline-start:clamp(0rem,3vw,3rem)}`,
  `.bld-story-eyebrow{margin:0 0 1.1rem;font-size:.72rem;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--ink-muted,currentColor);opacity:.85}`,
  `.bld-story-title{margin:0;font-family:var(--font-display),Georgia,serif;font-size:clamp(2.1rem,3.6vw,3.1rem);font-weight:400;line-height:1.08;letter-spacing:-.02em;text-wrap:balance;overflow-wrap:anywhere}`,
  `.bld-story-rule{display:block;width:2.25rem;height:1px;margin-top:1.1rem;background:var(--gold,var(--accent,#b08d57))}`,
  `.bld-story-text{margin:1.4rem 0 2rem;max-width:26rem;font-size:1.05rem;line-height:1.65;color:var(--ink-soft,inherit);text-wrap:pretty}.bld-story-text p{margin:0 0 .8em}.bld-story-text p:last-child{margin-bottom:0}`,
  `.bld-story-cta{min-height:3.25rem;padding-inline:2rem;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;text-decoration:none}`,
  `.bld-story-visual{grid-area:visual;position:relative;margin:0;min-width:0}`,
  `.bld-story-media{display:block;overflow:hidden;aspect-ratio:4/5}.bld-story[data-ratio="square"] .bld-story-media{aspect-ratio:1/1}.bld-story[data-ratio="landscape"] .bld-story-media{aspect-ratio:4/3}`,
  `.bld-story-img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .65s cubic-bezier(.16,1,.3,1)}`,
  `.bld-story[data-blend] .bld-story-img{object-fit:contain;mix-blend-mode:multiply}`,
  `@media (hover:hover) and (pointer:fine){.bld-story-visual:hover .bld-story-img{transform:scale(1.03)}}`,
  `.bld-story-card{position:absolute;z-index:3;left:50%;bottom:8%;box-sizing:border-box;width:min(15rem,calc(100% - 1rem));display:flex;flex-direction:column;gap:.3rem;padding:1.1rem 1.25rem;border:1px solid color-mix(in srgb,var(--champagne,#d9c9a8) 70%,transparent);border-radius:var(--radius-panel,0);background:var(--ivory,#fff);color:var(--midnight,#1f3d34);box-shadow:0 2px 4px rgb(0 0 0/6%),0 12px 32px rgb(0 0 0/14%);opacity:0;visibility:hidden;transform:translate(-50%,8px);transition:opacity .22s ease,transform .22s ease,visibility 0s linear .22s}`,
  `.bld-story-visual:hover .bld-story-card,.bld-story-visual:focus-within .bld-story-card{opacity:1;visibility:visible;transform:translate(-50%,0);transition-delay:0s}`,
  `@media (hover:none){.bld-story-card{opacity:1;visibility:visible;transform:translate(-50%,0)}}`,
  `.bld-story-card-title{font-family:var(--font-display),serif;font-size:1rem;line-height:1.3;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}`,
  `.bld-story-card-price{font-weight:600;font-size:.95rem}`,
  `.bld-story-card-link{margin-top:.35rem;align-self:flex-start;font-size:.82rem;color:var(--brass-deep,var(--brass,#8a6a3a));text-decoration:underline;text-underline-offset:3px}`,
  `.bld-story-empty{display:flex;align-items:center;justify-content:center;height:100%;border:1px dashed rgba(127,127,127,.5);font:13px system-ui,sans-serif;color:#777}`,
  `.bld-col>.bld-story:first-child,.bld-col>.bld-s:first-child>.bld-story{padding-top:0}.bld-col>.bld-story:last-child,.bld-col>.bld-s:last-child>.bld-story{padding-bottom:0}`,
  `@media (max-width:51.99rem){.bld-story,.bld-story--img-left,.bld-story--img-right{grid-template-columns:minmax(0,1fr);grid-template-areas:"visual" "copy";gap:1.75rem}.bld-story-copy{max-width:none;padding-inline:0!important}.bld-story-card{bottom:4%}.bld-story-text{max-width:none}}`,
].join("");

/** The document as HTML + CSS (the CSS is scoped later, like any section CSS). */
export function compileBuilder(
  doc: BuilderDoc,
  opts: { edit?: boolean } = {}
): { html: string; css: string } {
  const edit = opts.edit === true;
  const html =
    `<div class="bld"${doc.drawLines ? " data-bld-draw" : ""}${doc.stagger !== undefined ? ` data-bm-stagger="${doc.stagger}"` : ""}>\n` +
    doc.cells
      .map(
        (cell, c) =>
          `<div class="bld-col"${edit ? ` data-bi-col="${c}"` : ""}>\n${cell
            .map((block, i) => blockHtml(block, edit, c, i))
            .filter(Boolean)
            .join("\n")}\n</div>`
      )
      .join("\n") +
    `\n</div>`;
  const color = doc.dividerColor ?? "currentColor";
  const rule = RULE[doc.divider];
  const css = [
    `.bld{display:grid;grid-template-columns:minmax(0,1fr);gap:${doc.gap}rem;align-items:${doc.valign === "center" ? "center" : "start"}}`,
    doc.cells.some((cell) => cell.some((b) => b.sticky))
      ? `@media (min-width:48rem){.bld{align-items:stretch}.bld-sticky{position:sticky;top:1rem;z-index:2}}`
      : "",
    `@media (min-width:48rem){.bld{grid-template-columns:${
      doc.widths?.length === doc.columns
        ? doc.widths.map((w) => `minmax(0,${w}fr)`).join(" ")
        : `repeat(${doc.columns},minmax(0,1fr))`
    }}}`,
    rule && !doc.drawLines
      ? `@media (min-width:48rem){.bld-col+.bld-col{border-inline-start:${rule} ${color};padding-inline-start:${doc.gap}rem}}`
      : "",
    // Drawn-in lines: the divider is a pseudo-element that grows from the top.
    rule && doc.drawLines
      ? `@media (min-width:48rem){.bld-col{position:relative}.bld-col+.bld-col{padding-inline-start:${doc.gap}rem}.bld-col+.bld-col::before{content:"";position:absolute;inset-block:0;inset-inline-start:0;border-inline-start:${rule} ${color};transform-origin:top;transition:transform 1.1s cubic-bezier(.2,.7,.2,1)}.bld.bld-wait .bld-col::before{transform:scaleY(0)}}`
      : "",
    rule
      ? `@media (max-width:47.99rem){.bld-col+.bld-col{border-top:${rule} ${color};padding-top:${doc.gap}rem}}`
      : "",
    `.bld-col>*:first-child{margin-top:0}.bld-col>*:last-child{margin-bottom:0}`,
    `.bld-h{margin:0 0 .6em}.bld-h-s{font-size:1.1em}.bld-h-m{font-size:1.5em}.bld-h-l{font-size:clamp(1.6em,6vw,2.1em)}.bld-h-xl{font-size:clamp(2em,9vw,3.2em);line-height:1.05}.bld-h,.bld-text,.bld-quote,.bld-icon-title,.bld-icon-text{overflow-wrap:break-word}`,
    `.bld-b{max-width:100%;min-width:0;box-sizing:border-box}.bld-media-frame{overflow:hidden}.bld-media-frame>.bld-img,.bld-media-frame>.bld-video-file{border-radius:inherit}@media (max-width:47.99rem){.bld-moved{left:0!important;top:0!important}.bld-mx{left:var(--mx)!important}.bld-my{top:var(--my)!important}.bld-mw{width:var(--mw)!important;margin-inline:auto}.bld-mh{min-height:var(--mh)!important}.bld-fit.bld-mh{height:var(--mh)!important}.bld-sticky{position:static!important}}.bld-fit{overflow:hidden}.bld-fit img,.bld-fit video,.bld-fit iframe{display:block;width:100%;height:100%;object-fit:cover}`,
    `.bld-text p{margin:0 0 1em}.bld-img{display:block;width:100%;height:auto}.bld-fit>.bld-img{object-fit:contain}.bld-round{border-radius:.75rem}`,
    `.bld-btn-row{margin:1.25rem 0}.bld-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;box-sizing:border-box;max-width:100%;min-height:2.75rem;padding:.8rem 1.6rem;text-decoration:none;border:1px solid currentColor;font-weight:500;line-height:1.4;text-align:center;overflow-wrap:anywhere}.bld-btn:focus-visible{outline:2px solid var(--site-accent);outline-offset:4px}`,
    `.bld-btn-solid{background:var(--site-primary);color:var(--site-on-primary);border-color:var(--site-primary)}.bld-btn-solid:hover{filter:brightness(.93)}`,
    `.bld-btn-outline{background:transparent;color:inherit}.bld-btn-outline:hover{background:rgba(127,127,127,.12)}`,
    `.bld-hr{border:0;border-top:1px solid currentColor;opacity:.35;margin:1.5rem 0}`,
    `.bld-vline{width:0;border-inline-start:1px solid currentColor;opacity:.35;margin-inline:auto}`,
    `.bld-list{margin:0 0 1em;padding-inline-start:1.25rem;line-height:1.7}`,
    `.bld-quote{margin:0;padding-inline-start:1.25rem;border-inline-start:3px solid currentColor;font-size:1.25em;line-height:1.5}.bld-quote p{margin:0 0 .5em}.bld-quote cite{font-size:.9em;opacity:.7}`,
    `.bld-video{display:block;width:100%;aspect-ratio:16/9;border:0}`,
    `.bld-hr[data-bld-draw],.bld-vline[data-bld-draw]{transition:transform .9s cubic-bezier(.2,.7,.2,1)}.bld-hr[data-bld-draw]{transform-origin:left center}.bld-vline[data-bld-draw]{transform-origin:top center}.bld-hr[data-bld-draw].bld-wait{transform:scaleX(0)}.bld-vline[data-bld-draw].bld-wait{transform:scaleY(0)}`,
    `@media (prefers-reduced-motion:reduce){[data-bld-draw],.bld-col::before{transition:none!important}.bld-wait{transform:none!important}}`,
    `.bld-b{display:block}`,
    `.bld-fx{transition:transform .35s cubic-bezier(.2,.7,.2,1),box-shadow .35s ease}`,
    // Hover effects only where there is a real hover (not sticky on touch screens).
    `@media (hover:hover){.bld-fx-lift:hover{transform:translateY(-6px);box-shadow:0 14px 30px rgba(0,0,0,.18)}.bld-fx-tilt:hover{transform:perspective(700px) rotateX(2deg) rotateY(-4deg) scale(1.02)}.bld-fx-glow:hover{box-shadow:0 0 0 3px rgba(255,255,255,.6),0 0 28px 6px currentColor}.bld-fx-zoom:hover img{transform:scale(1.08)}.bld-fx-zoom:not(:has(img)):hover{transform:scale(1.04)}}`,
    `.bld-fx-zoom{overflow:hidden}.bld-fx-zoom img{transition:transform .6s cubic-bezier(.2,.7,.2,1)}`,
    `.bld-caret{display:inline-block;width:.08em;height:1em;margin-inline-start:.08em;background:currentColor;vertical-align:-.1em;animation:bld-blink 1s steps(2,start) infinite}@keyframes bld-blink{to{visibility:hidden}}`,
    `.bld-btn-row{transition:opacity .7s ease,transform .7s ease}.bld-wait-typing{opacity:0;transform:translateY(10px)}.bld-video-file{object-fit:cover}`,
    `.bld-hide-mobile{}@media (max-width:47.99rem){.bld-hide-mobile{display:none!important}}@media (min-width:48rem){.bld-hide-desktop{display:none!important}}`,
    // Phones: tidier defaults that the "On phones" settings can still override.
    `@media (max-width:47.99rem){.bld{gap:min(${doc.gap}rem,2rem)}.bld-vline{height:0!important;width:40%;border-inline-start:0;border-top:1px solid currentColor}.bld-eyebrow{letter-spacing:.14em;flex-wrap:wrap}.bld-btn{max-width:100%;text-align:center}}`,
    `@media (prefers-reduced-motion:reduce){.bld-fx,.bld-fx img{transition:none}.bld-fx:hover,.bld-fx:hover img{transform:none!important}}`,
    `.bld-counter,.bld-icon,.bld-stars-row,.bld-countdown-wrap{margin:0 0 1rem}`,
    `.bld-count{display:block;line-height:1;font-variant-numeric:tabular-nums}.bld-count-m{font-size:1.8em}.bld-count-l{font-size:clamp(2em,8vw,2.6em)}.bld-count-xl{font-size:clamp(2.6em,12vw,4em)}`,
    `.bld-count-label{display:block;margin-top:.4rem;opacity:.75}`,
    `.bld-icon-svg{display:inline-block;margin-bottom:.6rem}.bld-icon-title{margin:0 0 .35rem;font-size:1.2em}.bld-icon-text{margin:0;opacity:.8;line-height:1.6}`,
    `.bld-stars{display:inline-block;font-size:1.5em;letter-spacing:.1em;line-height:1;background:linear-gradient(90deg,#d4a017 calc(var(--r)/5*100%),rgba(0,0,0,.18) 0);-webkit-background-clip:text;background-clip:text;color:transparent}.bld-stars-label{margin-inline-start:.6rem;font-size:.95em;opacity:.8}`,
    `.bld-countdown{font-size:clamp(1.3em,6vw,2em);font-variant-numeric:tabular-nums;letter-spacing:.04em;overflow-wrap:anywhere}.bld-countdown-label{margin:0 0 .3rem;opacity:.75}`,
    `.bld-badge-row{margin:0 0 1rem}.bld-badge{display:inline-block;padding:.3rem .85rem;border-radius:999px;font-size:.75em;font-weight:700;letter-spacing:.12em;text-transform:uppercase;border:1px solid currentColor}.bld-badge-solid{background:var(--accent,#1f3d34);color:var(--ivory,#fff);border-color:transparent}.bld-badge-soft{background:rgba(127,127,127,.15);border-color:transparent}`,
    `.bld-map{display:block;width:100%;border:0}`,
    `.bld-h-ul::after{content:"";display:block;width:3.3rem;height:1px;background:var(--gold,#b08d57);margin:1rem 0 0}.bld-h-ul[style*="text-align:center"]::after{margin-inline:auto}.bld-h-ul[style*="text-align:right"]::after{margin-inline-start:auto}`,
    `.bld-h-ul-accent::after{background:var(--accent,#1f3d34)}.bld-h-ul-thick::after{height:3px;background:var(--accent,#1f3d34)}`,
    `.bld-eyebrow{display:flex;align-items:center;gap:.9em;margin:0 0 1.2rem;font-size:.8em;letter-spacing:.22em;text-transform:uppercase;font-weight:500;line-height:1.3}.bld-eyebrow-num{font-weight:700}.bld-eyebrow-sep{opacity:.45}.bld-eyebrow-label{opacity:.8}.bld-eyebrow-rule{flex:1;height:1px;min-width:2rem;background:currentColor;opacity:.45}.bld-eyebrow-center{justify-content:center}.bld-eyebrow-right{justify-content:flex-end}.bld-eyebrow-before .bld-eyebrow-rule{flex:0 0 3.5rem}`,
    `.bld-live:empty{min-height:12rem}`,
    `.bld-collection-row{list-style:none;margin:0;padding:0;display:grid;gap:1.5rem;grid-template-columns:minmax(0,1fr)}@media (min-width:48rem){.bld-collection-row{grid-template-columns:repeat(3,minmax(0,1fr))}}.bld-collection-card{display:flex;flex-direction:column;gap:.6rem;color:inherit;text-decoration:none;height:100%}.bld-collection-card img{display:block;width:100%;aspect-ratio:4/5;object-fit:cover}.bld-collection-name{font-size:1.4em;line-height:1.2}.bld-collection-desc{opacity:.8;line-height:1.6}.bld-collection-cta{font-size:.8em;letter-spacing:.18em;text-transform:uppercase;border-bottom:1px solid currentColor;align-self:flex-start;padding-bottom:.2em}`,
    `.bld-s{display:contents}.bld-col>.bld-s:first-child>*{margin-top:0}.bld-col>.bld-s:last-child>*{margin-bottom:0}`,
    `.bld-faq{border-top:1px solid rgba(127,127,127,.35)}.bld-faq-item{border-bottom:1px solid rgba(127,127,127,.35)}.bld-faq-item summary{cursor:pointer;list-style:none;padding:1.1rem 2rem 1.1rem 0;font-weight:600;position:relative}.bld-faq-item summary::-webkit-details-marker{display:none}.bld-faq-item summary::after{content:"+";position:absolute;right:.25rem;top:50%;transform:translateY(-50%);font-size:1.4em;font-weight:300}.bld-faq-item[open] summary::after{content:"−"}.bld-faq-a{padding:0 0 1.2rem;opacity:.85;line-height:1.7}.bld-faq-a p{margin:0 0 .8em}`,
    doc.cells.some((cell) => cell.some((b) => b.type === "story")) ? STORY_CSS : "",
    doc.width === "full" ? `.bld-col>.bld-story{padding-inline:clamp(1.25rem,5vw,4rem)}` : "",
    mobileCss(doc),
  ]
    .filter(Boolean)
    .join("\n");
  return { html, css };
}

// ---- Templates ------------------------------------------------------------

const h = (
  text: string,
  size: "s" | "m" | "l" | "xl" = "m",
  a?: Align,
  rule?: HeadingRule
): BuilderBlock => ({
  type: "heading",
  text,
  size,
  align: a,
  ...(rule && { rule }),
});
const t = (text: string, a?: Align): BuilderBlock => ({ type: "text", text, align: a });

export type SectionTemplate = {
  id: string;
  name: string;
  description: string;
  doc: BuilderDoc;
  /** Section style the template brings with it (background film, spacing…). */
  style?: SectionStyle;
  /** The built-in home section this template recreates, if it is one. */
  recreates?: string;
};

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: "highlights",
    name: "Three highlights",
    description: "Three columns separated by vertical lines.",
    doc: {
      columns: 3,
      gap: 2.5,
      divider: "thin",
      valign: "top",
      cells: [
        [
          h("Handmade", "m", "center"),
          t("Every piece is blown and finished by hand on Murano.", "center"),
        ],
        [
          h("Authentic", "m", "center"),
          t("Made on the island, with the glassmakers' own techniques.", "center"),
        ],
        [
          h("Delivered with care", "m", "center"),
          t("Wrapped in a gift box and shipped insured.", "center"),
        ],
      ],
    },
  },
  {
    id: "stats",
    name: "Numbers row",
    description: "Four big numbers with vertical lines.",
    doc: {
      columns: 4,
      gap: 2,
      divider: "thin",
      valign: "center",
      cells: [
        [h("700", "xl", "center"), t("years of tradition", "center")],
        [h("100%", "xl", "center"), t("made by hand", "center")],
        [h("48h", "xl", "center"), t("dispatch time", "center")],
        [h("30", "xl", "center"), t("days to return", "center")],
      ],
    },
  },
  {
    id: "image-text",
    name: "Image and text",
    description: "A photo beside a heading, text and button.",
    doc: {
      columns: 2,
      gap: 3,
      divider: "none",
      valign: "center",
      cells: [
        [{ type: "image", src: "/logo.png", alt: "", rounded: true }],
        [
          h("Our story", "l"),
          t(
            "Tell visitors who you are and why every piece matters.\n\nA second paragraph goes here."
          ),
          { type: "button", text: "Learn more", href: "/about", look: "solid" },
        ],
      ],
    },
  },
  {
    id: "banner",
    name: "Centred banner",
    description: "A big heading, a line of text and a button.",
    doc: {
      columns: 1,
      gap: 2,
      divider: "none",
      valign: "top",
      cells: [
        [
          h("Handmade in Murano", "xl", "center"),
          t("A short line that invites people to explore the collection.", "center"),
          {
            type: "button",
            text: "Shop the collection",
            href: "/products",
            look: "solid",
            align: "center",
          },
        ],
      ],
    },
  },
  {
    id: "quote",
    name: "Quote between lines",
    description: "A pull quote framed by horizontal lines.",
    doc: {
      columns: 1,
      gap: 2,
      divider: "none",
      valign: "top",
      cells: [
        [
          { type: "divider" },
          {
            type: "quote",
            text: "The most beautiful glass I have ever owned.",
            cite: "A happy customer",
          },
          { type: "divider" },
        ],
      ],
    },
  },
  {
    id: "two-text",
    name: "Two columns of text",
    description: "Two text columns with a vertical line between.",
    doc: {
      columns: 2,
      gap: 3,
      divider: "thin",
      valign: "top",
      cells: [
        [h("Care", "m"), t("How to keep your glass shining for years.")],
        [h("Shipping", "m"), t("Where we ship, how long it takes and what it costs.")],
      ],
    },
  },
  {
    id: "cta-band",
    name: "Call-to-action band",
    description: "A message on the left, a button on the right.",
    doc: {
      columns: 2,
      gap: 2,
      divider: "none",
      valign: "center",
      cells: [
        [h("Looking for a gift?", "l"), t("Let us help you choose the perfect piece.")],
        [
          {
            type: "button",
            text: "Find a gift",
            href: "/gift-finder",
            look: "solid",
            align: "right",
          },
        ],
      ],
    },
  },
  {
    id: "section-heading",
    name: "Heading with label",
    description: "A numbered label with a line, a big title and a thick rule.",
    doc: {
      columns: 1,
      gap: 1,
      divider: "none",
      valign: "top",
      cells: [
        [
          { type: "eyebrow", number: "02", text: "The pieces in this look", line: "after" },
          h("Rosa e Salvia", "xl", undefined, "thick"),
        ],
      ],
    },
  },
  {
    id: "carousel",
    name: "Product carousel",
    description: "A centred heading over a sliding row of your favourite pieces.",
    doc: {
      columns: 1,
      gap: 2,
      divider: "none",
      valign: "top",
      cells: [
        [
          h("Our community favourites", "l", "center", "gold"),
          { type: "carousel", source: "popular", count: 10 },
        ],
      ],
    },
  },
  {
    id: "home-faq-editable",
    name: "FAQ you write yourself",
    description: "Heading and questions and answers you type.",
    doc: {
      columns: 1,
      gap: 1.5,
      divider: "none",
      valign: "top",
      cells: [
        [
          h("Questions, answered", "l", undefined, "gold"),
          {
            type: "faq",
            items: [
              { q: "How long does delivery take?", a: "Orders ship within two working days." },
              { q: "Can I return a piece?", a: "Yes, within 30 days, unworn and in its box." },
              {
                q: "How do I care for my jewellery?",
                a: "Keep it dry, and store it in its pouch.",
              },
            ],
          },
        ],
      ],
    },
  },
  // ---- Editorial layouts: overlapping blocks, set by dragging in the canvas.
  {
    id: "overlap-title",
    name: "Text over photo",
    description: "A big title that overlaps the edge of a photo. Drag the ✥ handle to move it.",
    style: { bg: "#e9d8c9", padTop: 3, padBottom: 3 },
    doc: {
      columns: 2,
      gap: 0,
      divider: "none",
      valign: "center",
      cells: [
        [
          {
            ...h("Overlap text and photo", "xl"),
            style: { color: "#1f3d34", x: 28, z: 3 },
          } as BuilderBlock,
        ],
        [{ type: "image", src: "/logo.png", alt: "", style: { h: 30, z: 1 } }],
      ],
    },
  },
  {
    id: "magazine-page",
    name: "Magazine page",
    description: "A large photo with title boxes that sit across its edge, and a short text below.",
    style: { bg: "#faf0e4", color: "#6e3404", padTop: 2, padBottom: 2 },
    doc: {
      columns: 2,
      gap: 0,
      divider: "none",
      valign: "center",
      cells: [
        [{ type: "image", src: "/logo.png", alt: "", style: { h: 26, w: 100 } }],
        [
          {
            ...h("A simple", "m"),
            style: { bg: "#faf0e4", pad: 0.4, x: -22, z: 3, w: 60 },
          } as BuilderBlock,
          {
            ...h("Layout", "xl"),
            style: { bg: "#faf0e4", pad: 0.4, x: -22, z: 3, w: 60 },
          } as BuilderBlock,
          {
            ...t("A few lines about the picture, set in a block that overlaps it."),
            style: { bg: "#faf0e4", pad: 0.6, x: -12, z: 3, w: 80 },
          } as BuilderBlock,
        ],
      ],
    },
  },
  {
    id: "essay-opening",
    name: "Photo essay opening",
    description: "A huge title, a byline and a tall photo beside them.",
    style: { bg: "#e3eef0", padTop: 3, padBottom: 3 },
    doc: {
      columns: 2,
      gap: 3,
      divider: "none",
      valign: "center",
      cells: [
        [
          h("A title in big letters", "xl"),
          { ...h("By your name", "s"), style: { pad: 0 } } as BuilderBlock,
          t("One or two lines that tell people what the story is about."),
        ],
        [{ type: "image", src: "/logo.png", alt: "", style: { h: 34 } }],
      ],
    },
  },
  {
    id: "essay-chapter",
    name: "Numbered chapter",
    description: "A big pale number and a heading on one side, a quote and the text on the other.",
    doc: {
      columns: 2,
      gap: 2.5,
      divider: "none",
      valign: "top",
      cells: [
        [
          { ...h("01", "xl"), style: { color: "#c9bfb2" } } as BuilderBlock,
          { ...h("Chapter title", "s"), style: { color: "#1f3d34" } } as BuilderBlock,
        ],
        [
          {
            type: "quote",
            text: "A memorable line that sets the mood for this chapter.",
            cite: "Someone wise",
          },
          t("Your text goes here. Add as many paragraphs as the chapter needs."),
        ],
      ],
    },
  },
  {
    id: "photo-collage",
    name: "Photo collage",
    description: "Three photos that overlap each other. Drag them to rearrange the stack.",
    doc: {
      columns: 3,
      gap: 0,
      divider: "none",
      valign: "top",
      cells: [
        [{ type: "image", src: "/logo.png", alt: "", style: { h: 18, z: 1 } }],
        [{ type: "image", src: "/logo.png", alt: "", style: { h: 22, x: -12, y: 4, z: 2 } }],
        [{ type: "image", src: "/logo.png", alt: "", style: { h: 16, x: -24, y: -1, z: 3 } }],
      ],
    },
  },
  {
    id: "big-quote",
    name: "Big quote",
    description: "One large quote with an oversized pale quotation mark sitting behind it.",
    style: { bg: "#f4efe8", padTop: 4, padBottom: 4, align: "center", maxWidth: 52 },
    doc: {
      columns: 1,
      gap: 0,
      divider: "none",
      valign: "top",
      cells: [
        [
          {
            ...h("“", "xl", "center"),
            style: { color: "#d9cdbd", y: 2.5, z: 0 },
          } as BuilderBlock,
          {
            ...h("The kind of piece you keep and hand down.", "l", "center"),
            style: { z: 2 },
            motion: { type: "rise" },
          } as BuilderBlock,
          {
            ...t("A CUSTOMER, MURANO NECKLACE", "center"),
            motion: { type: "fade", order: 2 },
          } as BuilderBlock,
        ],
      ],
    },
  },
  {
    id: "photo-caption",
    name: "Tall photo and story",
    description: "A tall photo with a small caption, beside an eyebrow, a heading and the story.",
    style: { padTop: 3, padBottom: 3 },
    doc: {
      columns: 2,
      gap: 3,
      divider: "none",
      valign: "center",
      widths: [0.8, 1.2],
      cells: [
        [
          { type: "image", src: "/logo.png", alt: "", style: { h: 34 } },
          { ...t("Photo caption, a few words."), style: { w: 60 } } as BuilderBlock,
        ],
        [
          { type: "eyebrow", number: "01", text: "The story", line: "after" },
          h("A heading that sets the scene", "l"),
          t("Tell the story in a few short paragraphs.\n\nKeep each one to two or three lines."),
          { type: "button", text: "Read more", href: "/about", look: "outline" },
        ],
      ],
    },
  },
  {
    id: "photo-quote-overlap",
    name: "Photo with overlapping quote",
    description: "A wide photo with a quote card that overlaps its lower corner.",
    style: { padTop: 3, padBottom: 5 },
    doc: {
      columns: 2,
      gap: 0,
      divider: "none",
      valign: "top",
      widths: [1.4, 0.6],
      cells: [
        [{ type: "image", src: "/logo.png", alt: "", style: { h: 30 } }],
        [
          {
            type: "quote",
            text: "A line worth pulling out of the story.",
            cite: "Who said it",
            style: { bg: "#ffffff", pad: 1.5, x: -45, y: 18, z: 3, w: 130, shadow: "medium" },
            motion: { type: "slide-right", order: 2 },
          },
        ],
      ],
    },
  },
  {
    id: "three-steps",
    name: "Three numbered steps",
    description: "Three steps with big pale numbers, lines between them and a sequence animation.",
    style: { padTop: 3, padBottom: 3 },
    doc: {
      columns: 3,
      gap: 2.5,
      divider: "thin",
      valign: "top",
      stagger: 250,
      cells: [
        [
          { ...h("01", "xl"), style: { color: "#d9cdbd" }, motion: { type: "rise", order: 1 } },
          { ...h("Choose", "m"), motion: { type: "rise", order: 1 } },
          { ...t("Pick the piece that speaks to you."), motion: { type: "fade", order: 1 } },
        ],
        [
          { ...h("02", "xl"), style: { color: "#d9cdbd" }, motion: { type: "rise", order: 2 } },
          { ...h("Personalise", "m"), motion: { type: "rise", order: 2 } },
          { ...t("Add a colour, a length or a message."), motion: { type: "fade", order: 2 } },
        ],
        [
          { ...h("03", "xl"), style: { color: "#d9cdbd" }, motion: { type: "rise", order: 3 } },
          { ...h("Receive", "m"), motion: { type: "rise", order: 3 } },
          { ...t("Wrapped by hand and sent insured."), motion: { type: "fade", order: 3 } },
        ],
      ],
    } as BuilderDoc,
  },
  {
    id: "timeline",
    name: "Timeline",
    description: "Four dates in a row, with lines that draw themselves in as you scroll.",
    style: { padTop: 3, padBottom: 3 },
    doc: {
      columns: 4,
      gap: 2,
      divider: "thin",
      drawLines: true,
      valign: "top",
      cells: [
        [h("1291", "l"), t("Glassmakers are moved to the island of Murano.")],
        [h("1500", "l"), t("The art of crystal glass is perfected.")],
        [h("1900", "l"), t("Beads and jewellery spread across Europe.")],
        [h("Today", "l"), t("Every piece is still made by hand, one at a time.")],
      ],
    },
  },
  {
    id: "cover-title",
    name: "Magazine cover",
    description: "A full-width photo with the title pulled up over its lower edge.",
    style: { padTop: 2, padBottom: 3 },
    doc: {
      columns: 1,
      gap: 0,
      divider: "none",
      valign: "top",
      cells: [
        [
          { type: "image", src: "/logo.png", alt: "", style: { h: 28 } },
          {
            ...h("The Autumn Issue", "xl"),
            style: { y: -4, x: 6, z: 3, color: "#ffffff" },
            motion: { type: "skew-rise" },
          } as BuilderBlock,
          {
            ...t("New colours, new stories, made by hand."),
            style: { y: -3, x: 6 },
            motion: { type: "fade", order: 2 },
          } as BuilderBlock,
        ],
      ],
    },
  },
  {
    id: "photo-duo",
    name: "Two photos, offset",
    description: "Two photos at different heights, with a caption tucked between them.",
    style: { padTop: 3, padBottom: 4 },
    doc: {
      columns: 2,
      gap: 1.5,
      divider: "none",
      valign: "top",
      cells: [
        [
          { type: "image", src: "/logo.png", alt: "", style: { h: 22 } },
          { ...t("The first photo."), style: { w: 70 } } as BuilderBlock,
        ],
        [
          { type: "spacer", height: 4 },
          { type: "image", src: "/logo.png", alt: "", style: { h: 26 } },
          { ...t("The second photo."), style: { w: 70 } } as BuilderBlock,
        ],
      ],
    },
  },
  {
    id: "feature-review",
    name: "Featured review",
    description: "Stars, a big quote and who said it, beside a photo.",
    style: { bg: "#faf6f0", padTop: 3, padBottom: 3 },
    doc: {
      columns: 2,
      gap: 3,
      divider: "none",
      valign: "center",
      cells: [
        [{ type: "image", src: "/logo.png", alt: "", style: { h: 26 } }],
        [
          { type: "stars", rating: 5, label: "5 out of 5" },
          h("Better than the photos.", "l"),
          {
            type: "quote",
            text: "It arrived beautifully wrapped, and the colours are even richer in person.",
            cite: "A happy customer",
          },
        ],
      ],
    },
  },
  {
    id: "intro-columns",
    name: "Editorial intro",
    description: "An eyebrow and a huge heading, with the text set in two columns underneath.",
    style: { padTop: 3, padBottom: 3 },
    doc: {
      columns: 2,
      gap: 2.5,
      divider: "none",
      valign: "top",
      cells: [
        [
          { type: "eyebrow", number: "02", text: "Introduction", line: "after" },
          { ...h("Handmade, the slow way", "xl"), motion: { type: "rise" } } as BuilderBlock,
        ],
        [
          {
            ...t("Open with the idea behind it all, in a few lines."),
            motion: { type: "fade", order: 2 },
          } as BuilderBlock,
          {
            ...t("Then say how it is made, and why that matters."),
            motion: { type: "fade", order: 3 },
          } as BuilderBlock,
        ],
      ],
    },
  },
  {
    id: "blank",
    name: "Blank",
    description: "An empty single column.",
    doc: { columns: 1, gap: 2, divider: "none", valign: "top", cells: [[t("Your text here.")]] },
  },
];

/** True when the design has blocks that need the small client script
 *  (animated counters, live countdowns). */
export function builderNeedsRuntime(doc: BuilderDoc): boolean {
  return (
    !!doc.drawLines ||
    doc.cells.some((cell) =>
      cell.some(
        (b) =>
          !!b.motion ||
          !!b.parallax ||
          (b.type === "counter" && b.countUp !== false) ||
          b.type === "countdown" ||
          ((b.type === "divider" || b.type === "vline") && b.draw) ||
          ((b.type === "heading" || b.type === "text") && !!b.typing)
      )
    )
  );
}

// ---- Editing helpers (used by the visual canvas and the block list) --------

/** A new block of the given type with sensible starter content. */
export function freshBlock(type: BuilderBlock["type"]): BuilderBlock {
  switch (type) {
    case "heading":
      return { type, text: "Heading", size: "l" };
    case "text":
      return { type, text: "Write something here." };
    case "image":
      return { type, src: "", alt: "" };
    case "button":
      return { type, text: "Button", href: "/products", look: "solid" };
    case "divider":
      return { type };
    case "vline":
      return { type, height: 6 };
    case "shape":
      return { type, kind: "rectangle", fill: "#154230", style: { w: 50, h: 8 } };
    case "spacer":
      return { type, height: 2 };
    case "list":
      return { type, items: ["First", "Second"] };
    case "quote":
      return { type, text: "A memorable quote." };
    case "video":
      return { type, url: "" };
    case "counter":
      return {
        type,
        value: 2400,
        suffix: "+",
        label: "happy customers",
        size: "xl",
        align: "center",
      };
    case "icon":
      return {
        type,
        icon: "gem",
        title: "Handmade",
        text: "Made by hand on Murano.",
        align: "center",
      };
    case "stars":
      return { type, rating: 4.8, label: "from 1,200 reviews", align: "center" };
    case "countdown":
      return {
        type,
        until: `${new Date().getFullYear() + 1}-01-01T00:00`,
        label: "Sale ends in",
        doneText: "The sale has ended",
        align: "center",
      };
    case "badge":
      return { type, text: "New", look: "solid" };
    case "map":
      return { type, query: "Murano, Venice, Italy", height: 20 };
    case "carousel":
      return { type, source: "popular", count: 10 };
    case "eyebrow":
      return { type, number: "02", text: "The pieces in this look", line: "after" };
    case "shelf":
      return { type, source: "bestSellers", count: 4 };
    case "looks":
      return { type, count: 3 };
    case "reviews":
      return { type, count: 3 };
    case "newsletter":
      return { type };
    case "journal":
      return { type };
    case "siteFaq":
      return { type };
    case "showcase":
      return { type };
    case "original":
      return { type };
    case "story":
      return {
        type,
        eyebrow: "01",
        title: "A title for this story",
        text: "Two or three lines about the piece, the island or the people who make it.",
        cta: "See the piece",
        href: "/products",
        src: "",
        alt: "",
        side: "right",
        cardTitle: "Piece name",
        cardCta: "See the piece",
      };
    case "faq":
      return {
        type,
        items: [
          { q: "How long does delivery take?", a: "Orders ship within two working days." },
          { q: "Can I return a piece?", a: "Yes, within 30 days, unworn and in its box." },
        ],
      };
  }
}

export type BlockPos = { col: number; idx: number };

/** Moves a block to a new place (`to.idx` is the index it should end up
 *  before, counted in the column as it is before the move). */
export function moveBlock(doc: BuilderDoc, from: BlockPos, to: BlockPos): BuilderDoc {
  const block = doc.cells[from.col]?.[from.idx];
  if (!block || to.col < 0 || to.col >= doc.cells.length) return doc;
  const cells = doc.cells.map((cell) => cell.slice());
  cells[from.col].splice(from.idx, 1);
  let at = to.idx;
  if (from.col === to.col && from.idx < to.idx) at -= 1;
  at = Math.max(0, Math.min(cells[to.col].length, at));
  if (cells[to.col].length >= MAX_BLOCKS_PER_COLUMN && from.col !== to.col) return doc;
  cells[to.col].splice(at, 0, block);
  return { ...doc, cells };
}

/** Validate editor drag payloads, keep locked blocks in place and select the result. */
export function applyBlockDrop(
  doc: BuilderDoc,
  payload: string,
  to: BlockPos
): { doc: BuilderDoc; selected: BlockPos | null } {
  if (!Number.isInteger(to.col) || !Number.isInteger(to.idx) || to.idx < 0 || !doc.cells[to.col])
    return { doc, selected: null };
  const moved = /^move:(\d+):(\d+)$/.exec(payload);
  if (moved) {
    const from = { col: Number(moved[1]), idx: Number(moved[2]) };
    const block = doc.cells[from.col]?.[from.idx];
    if (!block || block.locked) return { doc, selected: null };
    const next = moveBlock(doc, from, to);
    return {
      doc: next,
      selected: next === doc ? null : { col: to.col, idx: next.cells[to.col].indexOf(block) },
    };
  }
  const added = /^new:([a-zA-Z]+)$/.exec(payload);
  if (!added || !Object.hasOwn(BLOCK_NAMES, added[1])) return { doc, selected: null };
  const block = freshBlock(added[1] as BuilderBlock["type"]);
  const next = insertBlock(doc, to, block);
  return {
    doc: next,
    selected: next === doc ? null : { col: to.col, idx: next.cells[to.col].indexOf(block) },
  };
}

/** Inserts a new block before `to.idx` in column `to.col`. */
export function insertBlock(doc: BuilderDoc, to: BlockPos, block: BuilderBlock): BuilderDoc {
  if (to.col < 0 || to.col >= doc.cells.length) return doc;
  if (doc.cells[to.col].length >= MAX_BLOCKS_PER_COLUMN) return doc;
  const cells = doc.cells.map((cell) => cell.slice());
  cells[to.col].splice(Math.max(0, Math.min(cells[to.col].length, to.idx)), 0, block);
  return { ...doc, cells };
}

const mapBlock = (
  doc: BuilderDoc,
  pos: BlockPos,
  change: (block: BuilderBlock) => BuilderBlock
): BuilderDoc => {
  if (!doc.cells[pos.col]?.[pos.idx]) return doc;
  return {
    ...doc,
    cells: doc.cells.map((cell, c) =>
      c === pos.col ? cell.map((b, i) => (i === pos.idx ? change(b) : b)) : cell
    ),
  };
};

/** Sets or clears (undefined) top-level fields of one block. */
export function patchBlock(
  doc: BuilderDoc,
  pos: BlockPos,
  patch: Partial<Record<keyof BuilderBlock, unknown>>
): BuilderDoc {
  return mapBlock(doc, pos, (block) => {
    const next: Record<string, unknown> = { ...block, ...patch };
    for (const key of Object.keys(next)) if (next[key] === undefined) delete next[key];
    return next as BuilderBlock;
  });
}

export function removeBlock(doc: BuilderDoc, positions: BlockPos[]): BuilderDoc {
  const drop = new Set(positions.map((p) => `${p.col}:${p.idx}`));
  return {
    ...doc,
    cells: doc.cells.map((cell, c) => cell.filter((_, i) => !drop.has(`${c}:${i}`))),
  };
}

export function duplicateBlock(doc: BuilderDoc, pos: BlockPos): BuilderDoc {
  const block = doc.cells[pos.col]?.[pos.idx];
  if (!block || doc.cells[pos.col].length >= MAX_BLOCKS_PER_COLUMN) return doc;
  const copy = structuredClone(block);
  delete copy.locked;
  delete copy.group;
  if (copy.style && (copy.style.x !== undefined || copy.style.y !== undefined)) {
    copy.style = {
      ...copy.style,
      x: Math.min(60, (copy.style.x ?? 0) + 3),
      y: Math.min(30, (copy.style.y ?? 0) + 1),
    };
  }
  return insertBlock(doc, { col: pos.col, idx: pos.idx + 1 }, copy);
}

/** Every block that shares a group name with the block at `pos` (or just it). */
export function groupMembers(doc: BuilderDoc, pos: BlockPos): BlockPos[] {
  const group = doc.cells[pos.col]?.[pos.idx]?.group;
  if (!group) return [pos];
  return doc.cells.flatMap((cell, col) =>
    cell.flatMap((b, idx) => (b.group === group ? [{ col, idx }] : []))
  );
}

/** Gives the blocks one shared group name (they then select and move together). */
export function groupBlocks(doc: BuilderDoc, positions: BlockPos[]): BuilderDoc {
  const taken = new Set(doc.cells.flatMap((cell) => cell.map((b) => b.group)));
  let n = 1;
  while (taken.has(`g${n}`)) n++;
  return positions.reduce((d, p) => patchBlock(d, p, { group: `g${n}` }), doc);
}

export function ungroupBlocks(doc: BuilderDoc, positions: BlockPos[]): BuilderDoc {
  return positions.reduce((d, p) => patchBlock(d, p, { group: undefined }), doc);
}

/** The look of a block that can be copied to others: style, hover effect,
 *  animation, looping animation, parallax, sticky and phone visibility. */
export type BlockLookCopy = Pick<
  BuilderBlock,
  "style" | "effect" | "hide" | "motion" | "idle" | "parallax" | "sticky"
>;
export function copyLook(block: BuilderBlock): BlockLookCopy {
  const { style, effect, hide, motion, idle, parallax, sticky } = block;
  return structuredClone({ style, effect, hide, motion, idle, parallax, sticky });
}
export function pasteLook(doc: BuilderDoc, positions: BlockPos[], look: BlockLookCopy): BuilderDoc {
  return positions.reduce(
    (d, p) =>
      patchBlock(d, p, {
        style: look.style ? structuredClone(look.style) : undefined,
        effect: look.effect,
        hide: look.hide,
        motion: look.motion ? structuredClone(look.motion) : undefined,
        idle: look.idle,
        parallax: look.parallax,
        sticky: look.sticky,
      }),
    doc
  );
}

/** Brings a block to the front (or sends it to the back) among the overlapping ones. */
export function reorderLayer(doc: BuilderDoc, pos: BlockPos, where: "front" | "back"): BuilderDoc {
  const zs = doc.cells.flatMap((cell) => cell.map((b) => b.style?.z ?? 0));
  const z =
    where === "front" ? Math.min(20, Math.max(...zs, 0) + 1) : Math.max(-5, Math.min(...zs, 0) - 1);
  return patchBlockStyle(doc, pos, { z });
}

/** Text fields that are one line (Enter finishes the edit instead of adding a line). */
const SINGLE_LINE = new Set([
  "heading.text",
  "button.text",
  "badge.text",
  "icon.title",
  "counter.label",
  "stars.label",
  "eyebrow.text",
  "eyebrow.number",
  "countdown.label",
  "quote.text",
]);
export const isSingleLineField = (type: string, field: string) =>
  SINGLE_LINE.has(`${type}.${field}`);

/** The raw (markup-syntax) text of a block's editable field. */
export function getRawField(block: BuilderBlock, field: string): string | undefined {
  const value = (block as Record<string, unknown>)[field];
  return typeof value === "string" ? value : undefined;
}

export function setRawField(
  doc: BuilderDoc,
  pos: BlockPos,
  field: string,
  value: string
): BuilderDoc {
  const block = doc.cells[pos.col]?.[pos.idx];
  if (!block || getRawField(block, field) === undefined) return doc;
  const cells = doc.cells.map((cell, c) =>
    c === pos.col
      ? cell.map((b, i) => (i === pos.idx ? ({ ...b, [field]: value } as BuilderBlock) : b))
      : cell
  );
  return { ...doc, cells };
}

/** Sets the relative column widths (equal widths clear them). */
export function setColumnWidths(doc: BuilderDoc, widths: number[] | undefined): BuilderDoc {
  const next = { ...doc, widths };
  if (!widths || widths.length !== doc.columns || widths.every((w) => w === widths[0]))
    delete next.widths;
  return next;
}

/** Merges a size change into one block's style; undefined removes a key. */
export function patchBlockStyle(
  doc: BuilderDoc,
  pos: BlockPos,
  patch: Partial<BlockStyle>
): BuilderDoc {
  const block = doc.cells[pos.col]?.[pos.idx];
  if (!block) return doc;
  const merged: Record<string, unknown> = { ...block.style, ...patch };
  for (const key of Object.keys(merged)) if (merged[key] === undefined) delete merged[key];
  const next = { ...block, style: Object.keys(merged).length ? merged : undefined } as BuilderBlock;
  if (!next.style) delete next.style;
  return {
    ...doc,
    cells: doc.cells.map((cell, c) =>
      c === pos.col ? cell.map((b, i) => (i === pos.idx ? next : b)) : cell
    ),
  };
}

/** CSS for the canvas only: outlines, drop markers, the text being edited. */
export const CANVAS_CSS = `
.bld-e{position:relative;min-width:0;box-sizing:border-box;cursor:grab;outline:1px dashed transparent;outline-offset:3px;transition:outline-color .15s}
.bld-e:hover{outline-color:rgba(21,66,48,.55)}
.bld-e.bld-sel{outline:2px solid #154230}
.bld-e.bld-dragging{opacity:.4}
.bld-rz{position:absolute;z-index:5;background:#154230;border:2px solid #fff;border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,.35)}
.bld-rz-r{top:50%;right:-8px;width:12px;height:32px;margin-top:-16px;cursor:ew-resize}
.bld-rz-b{left:50%;bottom:-8px;height:12px;width:32px;margin-left:-16px;cursor:ns-resize}
.bld-col{position:relative}
.bld-an{--bm-p:1}
body.bld-playing .bld-an{--bm-p:0;transition:--bm-p var(--bm-dur,.8s) var(--bm-ease,cubic-bezier(.2,.7,.2,1)) var(--bm-del,0s)}
body.bld-playing .bld-an.bld-in{--bm-p:1}
body:not(.bld-playing) .bld-idle>*{animation:none!important}
.bld-locked{cursor:not-allowed!important}.bld-locked.bld-sel{outline-style:dashed!important}
.bld-ghost{display:none!important}
.bld-grid{position:absolute;inset:0;pointer-events:none;z-index:8;display:grid;grid-template-columns:repeat(12,1fr);gap:0}
.bld-grid i{border-inline:1px solid rgba(21,66,48,.18);background:rgba(21,66,48,.04)}
.bld-ctx{position:fixed;z-index:30;min-width:11rem;background:#fff;color:#111;border:1px solid #ccc;border-radius:6px;box-shadow:0 8px 24px rgba(0,0,0,.2);font:13px system-ui,sans-serif;padding:4px}
.bld-ctx button{display:block;width:100%;text-align:left;padding:6px 10px;border:0;background:none;cursor:pointer;border-radius:4px;font:inherit;color:inherit}
.bld-ctx button:hover{background:#eef}.bld-ctx button:disabled{opacity:.4;cursor:default}
.bld-ctx hr{border:0;border-top:1px solid #ddd;margin:3px 0}
.bld-gap{position:fixed;z-index:9;pointer-events:none;background:rgba(255,45,135,.9);color:#fff;font:10px/1 system-ui,sans-serif;padding:2px 4px;border-radius:3px;transform:translate(-50%,-50%)}
.bld-multi{outline:2px solid #154230!important;outline-offset:3px}
.bld-guide{position:fixed;z-index:9;pointer-events:none;background:#a6824a}
.bld-guide-v{top:0;bottom:0;width:1px;margin-left:-.5px}
.bld-guide-h{left:0;right:0;height:1px;margin-top:-.5px}
.bld-cz{position:absolute;z-index:4;top:0;bottom:0;left:-9px;width:18px;cursor:col-resize;display:none}
.bld-cz::after{content:"";position:absolute;top:0;bottom:0;left:8px;width:2px;background:#154230;opacity:0;transition:opacity .15s}
.bld-cz:hover::after,.bld-cz.bld-cz-on::after{opacity:1}
.bld-cz-tip{position:absolute;z-index:6;top:4px;left:12px;padding:2px 6px;border-radius:4px;background:#111;color:#fff;font:11px system-ui,sans-serif;pointer-events:none;white-space:nowrap}
@media (min-width:48rem){.bld-cz{display:block}}
.bld-rz-m{top:-8px;left:-8px;width:22px;height:22px;cursor:move;display:flex;align-items:center;justify-content:center;color:#fff;font:14px/1 system-ui,sans-serif}
.bld-rz-c{right:-8px;bottom:-8px;width:16px;height:16px;cursor:nwse-resize}
.bld-rz-tip{position:absolute;z-index:6;right:4px;top:4px;padding:2px 6px;border-radius:4px;background:#111;color:#fff;font:11px system-ui,sans-serif;pointer-events:none}
.bld-e [data-bi-field]{cursor:text}
.bld-e a{cursor:text}
.bld-live:empty::before{content:attr(data-bld-label);display:flex;align-items:center;justify-content:center;min-height:12rem;border:1px dashed rgba(127,127,127,.6);font:13px system-ui,sans-serif;color:#666;text-align:center;padding:1rem}
.bld-empty{padding:.75rem;border:1px dashed rgba(127,127,127,.6);font:12px system-ui,sans-serif;color:#666;text-align:center}
.bld-col{min-height:3.5rem;outline:1px dashed rgba(127,127,127,.3);outline-offset:4px}
.bld-drop-before{box-shadow:0 -4px 0 #154230}
.bld-drop-after{box-shadow:0 4px 0 #154230}
.bld-col.bld-drop-end{box-shadow:inset 0 0 0 3px #154230}
[data-bi-field][contenteditable]{outline:2px solid #154230;outline-offset:3px;white-space:pre-wrap;cursor:text;min-width:2ch}
`;

/** The product carousels a design contains (they show live products). */
export function builderCarousels(doc: BuilderDoc): { source: CarouselSource; count: number }[] {
  return doc.cells.flatMap((cell) =>
    cell.flatMap((b) => (b.type === "carousel" ? [{ source: b.source, count: b.count }] : []))
  );
}

/** A block's wrapper (own style, effect, animation) for the React renderer;
 *  null when it has none. */
export function blockWrap(
  block: BuilderBlock,
  position = 0
): { className: string; style?: Record<string, string>; data?: Record<string, string> } | null {
  if (!needsWrap(block)) return null;
  const f = blockFrame(block, position);
  const style: Record<string, string> = {};
  for (const decl of [...f.layout, ...f.look, ...(f.vars ? f.vars.split(";") : [])]) {
    const at = decl.indexOf(":");
    const prop = decl.slice(0, at);
    // Custom properties keep their name; others become camelCase for React.
    const key = prop.startsWith("--")
      ? prop
      : prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    style[key] = decl.slice(at + 1);
  }
  return {
    data: Object.keys(f.attrs).length ? f.attrs : undefined,
    className: [...f.classes, f.layoutClass].filter(Boolean).join(" "),
    style: Object.keys(style).length ? style : undefined,
  };
}
