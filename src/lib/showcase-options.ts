import { safeColor, safeImageUrl } from "@/lib/custom-section";
import { SCROLL_PER_UNIT, clampPerUnit, type SceneTransition } from "@/lib/showcase-timeline";

/**
 * What an admin can change about the collections scroll story from the visual
 * editor: the text, link, picture and side of each scene, and how the scroll
 * itself behaves. Everything is validated here, once, for the editor, the saved
 * JSON and the storefront alike.
 */

export const SHOWCASE_SCENES = ["necklace", "bracelet", "earrings"] as const;
export const SHOWCASE_STYLES = [
  { value: "editorial", label: "Editorial — offset paper plane" },
  { value: "minimal", label: "Minimal — jewellery on an open canvas" },
  { value: "classical", label: "Classical — fine frame and serif title" },
  { value: "arched", label: "Gallery — arched photograph plane" },
  { value: "bold", label: "Bold editorial — coloured disc and large title" },
  { value: "studio", label: "Studio — pale photograph plane and quiet typography" },
  { value: "couture", label: "Couture — layered paper and an italic headline" },
] as const;
export type ShowcaseSceneKey = (typeof SHOWCASE_SCENES)[number];

export type ShowcaseSceneOverride = {
  name?: string;
  description?: string;
  cta?: string;
  /** A site path or https:// link. */
  href?: string;
  /** A picture of the admin's own (an upload or a site path). */
  image?: string;
  /** Which side of the picture the text sits on (default: alternating). */
  side?: "left" | "right";
};

export type ShowcaseScroll = {
  style?: (typeof SHOWCASE_STYLES)[number]["value"];
  /** Scroll per step, as a fraction of the screen height (0.25–1.5; default 0.5). */
  distance?: number;
  /** How the scenes change; absent = the pictures slide. */
  transition?: "fade" | "zoom";
  /** false hides the progress dots / the 01 / 03 counter / the button / the text / the swipe hint. */
  rail?: false;
  counter?: false;
  cta?: false;
  text?: false;
  hint?: false;
  /** Colours: background, title, text, button background, button text. */
  bg?: string;
  title?: string;
  textColor?: string;
  accent?: string;
  accentText?: string;
};

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const SAFE_LINK = /^(\/(?!\/)|https:\/\/)[^\s"'<>]*$/;

export function parseSceneOverride(value: unknown): ShowcaseSceneOverride | undefined {
  if (!value || typeof value !== "object") return undefined;
  const v = value as Record<string, unknown>;
  const href = str(v.href, 500).trim();
  const out: ShowcaseSceneOverride = {
    name: str(v.name, 60).trim() || undefined,
    description: str(v.description, 300).trim() || undefined,
    cta: str(v.cta, 60).trim() || undefined,
    href: SAFE_LINK.test(href) ? href : undefined,
    image: safeImageUrl(v.image),
    side: v.side === "left" || v.side === "right" ? v.side : undefined,
  };
  return Object.values(out).some((x) => x !== undefined) ? out : undefined;
}

export function parseShowcaseScroll(value: unknown): ShowcaseScroll | undefined {
  if (!value || typeof value !== "object") return undefined;
  const v = value as Record<string, unknown>;
  const distance =
    typeof v.distance === "number" && Number.isFinite(v.distance)
      ? Math.round(clampPerUnit(v.distance) * 100) / 100
      : undefined;
  const out: ShowcaseScroll = {
    style: SHOWCASE_STYLES.slice(1).some((style) => style.value === v.style)
      ? (v.style as ShowcaseScroll["style"])
      : undefined,
    distance: distance !== undefined && distance !== SCROLL_PER_UNIT ? distance : undefined,
    transition: v.transition === "fade" || v.transition === "zoom" ? v.transition : undefined,
    rail: v.rail === false ? false : undefined,
    counter: v.counter === false ? false : undefined,
    cta: v.cta === false ? false : undefined,
    text: v.text === false ? false : undefined,
    hint: v.hint === false ? false : undefined,
    bg: safeColor(v.bg),
    title: safeColor(v.title),
    textColor: safeColor(v.textColor),
    accent: safeColor(v.accent),
    accentText: safeColor(v.accentText),
  };
  return Object.values(out).some((x) => x !== undefined) ? out : undefined;
}

/** What the section's root element carries: attributes the stylesheet reads,
 *  colour variables, and the numbers the scroll script uses. */
export function showcaseRoot(scroll?: ShowcaseScroll) {
  const attrs: Record<string, string> = {};
  const vars: Record<string, string> = {};
  if (scroll?.style) attrs["data-showcase-style"] = scroll.style;
  if (scroll?.rail === false) attrs["data-no-rail"] = "";
  if (scroll?.counter === false) attrs["data-no-counter"] = "";
  if (scroll?.cta === false) attrs["data-no-cta"] = "";
  if (scroll?.text === false) attrs["data-no-text"] = "";
  if (scroll?.hint === false) attrs["data-no-hint"] = "";
  const colours: [string | undefined, string][] = [
    [scroll?.bg, "--sc-bg"],
    [scroll?.title, "--sc-title"],
    [scroll?.textColor, "--sc-text"],
    [scroll?.accent, "--sc-accent"],
    [scroll?.accentText, "--sc-accent-text"],
  ];
  for (const [value, name] of colours) if (value) vars[name] = value;
  if (Object.keys(vars).length) attrs["data-colors"] = "";
  const transition: SceneTransition = scroll?.transition ?? "slide";
  return { attrs, vars, unit: clampPerUnit(scroll?.distance), transition };
}
