/**
 * Custom page sections written in Admin > Settings > Page layout: HTML + CSS
 * typed by an admin. Admin-only input, but still defended in depth: the site CSP
 * already blocks inline scripts and handlers, and this strips them too, keeps
 * iframes to YouTube/Vimeo, and scopes the CSS to the section it belongs to.
 */

export const MAX_CUSTOM_SECTIONS = 12;
export const MAX_CUSTOM_HTML = 20000;
/** Hand-edited replacement HTML for a built-in section (a snapshot of its markup). */
export const MAX_OVERRIDE_HTML = 60000;
export const MAX_CUSTOM_CSS = 8000;

export const CUSTOM_ID_RE = /^custom-[a-z0-9]{4,12}$/;

const SAFE_IFRAME_SRC =
  /^https:\/\/(www\.youtube-nocookie\.com\/embed\/[\w-]{11}|player\.vimeo\.com\/video\/\d+)(\?[\w=&%.-]*)?$/;
// Google Maps "embed" URLs, which the builder's map block produces.
const SAFE_MAP_SRC = /^https:\/\/www\.google\.com\/maps\?q=[\w%.~-]{1,600}&(amp;)?output=embed$/;

export function sanitizeSectionHtml(html: string): string {
  let out = html
    // Whole elements that can run code, load other documents or restyle the page.
    .replace(
      /<(script|style|object|embed|applet|base|meta|link|form|template)\b[\s\S]*?<\/\1\s*>/gi,
      ""
    )
    .replace(/<\/?(script|style|object|embed|applet|base|meta|link|form|template)\b[^>]*>/gi, "");

  // iframes: only YouTube / Vimeo embeds and Google Maps survive.
  out = out.replace(/<iframe\b([^>]*)>\s*(?:<\/iframe\s*>)?/gi, (_match, attrs: string) => {
    const src = /\bsrc\s*=\s*["']([^"']*)["']/i.exec(attrs)?.[1] ?? "";
    if (SAFE_MAP_SRC.test(src)) {
      const h = Number(/\bdata-h\s*=\s*["'](\d+(?:\.\d+)?)["']/i.exec(attrs)?.[1] ?? 20);
      const height = Math.min(40, Math.max(8, Number.isFinite(h) ? h : 20));
      return `<iframe src="${src}" loading="lazy" style="width:100%;height:${height}rem;border:0"></iframe>`;
    }
    return SAFE_IFRAME_SRC.test(src)
      ? `<iframe src="${src}" loading="lazy" allowfullscreen style="width:100%;aspect-ratio:16/9;border:0"></iframe>`
      : "";
  });

  return (
    out
      // Event handler attributes (onclick=…), quoted or not.
      .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      // Script-capable URLs.
      .replace(
        /\b(href|src|action|formaction|xlink:href|srcdoc)\s*=\s*(["']?)\s*(javascript|vbscript|data)\s*:[^"'\s>]*\2/gi,
        '$1="#"'
      )
  );
}

/** Wraps an admin's CSS in `.className { … }` (CSS nesting) so it can only
 *  affect its own section. Returns "" for CSS that is unbalanced or tries to
 *  escape the wrapper. */
export function scopeSectionCss(css: string, className: string): string {
  const cleaned = css
    .replace(/<\/?style[^>]*>/gi, "")
    .replace(/<!--|-->/g, "")
    .replace(/@import[^;]*;?/gi, "")
    .replace(/expression\s*\(|javascript:|behavior\s*:|-moz-binding/gi, "")
    .trim();
  if (!cleaned) return "";
  let depth = 0;
  for (const ch of cleaned) {
    if (ch === "{") depth++;
    else if (ch === "}" && --depth < 0) return "";
  }
  if (depth !== 0 || cleaned.includes("<")) return "";
  return `.${className}{${cleaned}}`;
}

/** A background colour or gradient the style panel accepts: hex, rgb(a),
 *  hsl(a) or a plain colour name. Anything else is dropped. */
export function safeColor(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  if (/^#[0-9a-f]{3,8}$/i.test(v)) return v;
  if (/^(rgb|hsl)a?\(\s*[\d.,%\s/-]+\)$/i.test(v)) return v;
  if (/^[a-z]{3,20}$/i.test(v)) return v;
  // The site's own palette, by name, so a design follows Settings > Site style.
  if (SITE_COLOR_VAR.test(v)) return v;
  return undefined;
}

/** `var(--…)` references to the site's palette that designs may use. */
export const SITE_COLOR_VAR =
  /^var\(--(site-(bg|surface|text|text-muted|primary|on-primary|accent|border)|ivory|midnight|brass|brass-light|champagne|ground|primary|on-primary|ink-muted|hairline|tint-[a-z]{2,12}|violet-night)\)$/;

/** A background image: a /path on this site or an https:// URL, with no
 *  characters that could break out of CSS url("…"). */
export function safeImageUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  return /^(\/(?!\/)|https:\/\/)[^"'()\s\\<>]{1,1000}$/.test(v) ? v : undefined;
}

export const MAX_SECTION_CSS = 4000;

/** A background video file: a /path or https:// link to .mp4 or .webm. */
export function safeVideoUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  return /^(\/(?!\/)|https:\/\/)[^"'()\s\\<>]{1,800}\.(mp4|webm)(\?[^"'()\s\\<>]{0,200})?$/i.test(v)
    ? v
    : undefined;
}
