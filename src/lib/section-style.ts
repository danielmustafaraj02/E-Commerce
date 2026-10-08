import type { SectionStyle } from "@/lib/page-layout";

/** True when the section needs the layer element (video and/or overlay). */
export function hasBackgroundLayers(style?: SectionStyle): boolean {
  return (
    !!style && (!!style.bgVideo || (!!style.overlayColor && (style.overlayStrength ?? 40) > 0))
  );
}

const FADE_TO = { left: "to right", right: "to left", top: "to bottom", bottom: "to top" } as const;

/** The overlay's paint: even, or a veil fading out from one side. */
const overlayTint = (style: SectionStyle) =>
  `color-mix(in srgb, ${style.overlayColor} ${style.overlayStrength ?? 40}%, transparent)`;

function overlayBackground(style: SectionStyle): string {
  const tint = overlayTint(style);
  return style.overlayFade
    ? `linear-gradient(${FADE_TO[style.overlayFade]}, ${tint} 0%, ${tint} 28%, transparent 78%)`
    : tint;
}

/** The background video and colour overlay as HTML, drawn behind the content. */
export function backgroundLayersHtml(style?: SectionStyle): string {
  if (!style || !hasBackgroundLayers(style)) return "";
  const video = style.bgVideo
    ? `<video class="lay-bg-video" src="${style.bgVideo}" autoplay muted loop playsinline preload="metadata"></video>`
    : "";
  const overlay =
    style.overlayColor && (style.overlayStrength ?? 40) > 0
      ? style.overlayFade
        ? `<div class="lay-bg-overlay" data-fade style="--ov:${overlayTint(style)};background:${overlayBackground(style)}"></div>`
        : `<div class="lay-bg-overlay" style="background:${overlayBackground(style)}"></div>`
      : "";
  return `${video}${overlay}`;
}

/** A section's appearance options as inline CSS (camelCase keys, usable both
 *  as a React `style` object and with Object.assign(el.style, …)). */
export function sectionInlineStyle(style?: SectionStyle): Record<string, string> {
  const css: Record<string, string> = {};
  if (!style) return css;
  if (style.bg) css.background = style.bg;
  if (style.bgImage) {
    css.backgroundImage = `url("${style.bgImage}")`;
    css.backgroundSize =
      style.bgFit === "custom" ? `${style.bgScale ?? 100}% auto` : (style.bgFit ?? "cover");
    css.backgroundPosition = `${style.bgPositionX ?? 50}% ${style.bgPositionY ?? 50}%`;
    css.backgroundRepeat = style.bgRepeat ?? "no-repeat";
  } else if (style.gradFrom && style.gradTo) {
    css.backgroundImage = `linear-gradient(${style.gradAngle ?? 135}deg, ${style.gradFrom}, ${style.gradTo})`;
  }
  if (hasBackgroundLayers(style)) {
    css.position = "relative";
    css.isolation = "isolate";
    css.overflow = "hidden";
  }
  if (style.minHeight !== undefined) {
    // svh so a phone's address bar never pushes the content below the fold.
    css.minHeight = `${style.minHeight}svh`;
    css.display = "grid";
    css.alignContent = "center";
  }
  if (style.color) css.color = style.color;
  if (style.align) css.textAlign = style.align;
  if (style.maxWidth !== undefined) {
    css.maxWidth = `${style.maxWidth}rem`;
    css.marginInline = "auto";
  }
  if (style.borderTop) css.borderTop = "1px solid currentColor";
  if (style.borderBottom) css.borderBottom = "1px solid currentColor";
  if (style.padInline !== undefined) css.paddingInline = `${style.padInline}rem`;
  if (style.radius !== undefined) {
    css.borderRadius = `${style.radius}rem`;
    css.overflow = "hidden";
  }
  if (style.padTop !== undefined) css.paddingTop = `${style.padTop}rem`;
  if (style.padBottom !== undefined) css.paddingBottom = `${style.padBottom}rem`;
  return css;
}

/** A section's display options as data attributes (`backLink: "off"` becomes
 *  `data-opt-back-link="off"`), which the page's CSS reacts to. */
export function optionAttributes(options?: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(options ?? {})) {
    out[`data-opt-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`] = value;
  }
  return out;
}
