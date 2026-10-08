/**
 * Makes HTML pleasant to read and edit: one tag per line, indented by depth,
 * short text-only elements kept on one line. Also cleans a section's rendered
 * markup (taken from the live page) of the framework noise that makes it hard
 * to read: image-optimiser URLs, srcset lists, hydration attributes.
 */

const VOID = new Set(["img", "br", "hr", "input", "source", "meta", "link", "wbr", "col"]);
const INLINE = new Set([
  "a",
  "b",
  "strong",
  "i",
  "em",
  "span",
  "small",
  "u",
  "code",
  "sup",
  "sub",
  "br",
  "abbr",
  "mark",
]);

export function formatHtml(html: string): string {
  const tokens = html
    .replace(/\s+/g, " ")
    .split(/(<[^>]+>)/)
    .filter((tok) => tok.trim() !== "");
  const out: string[] = [];
  let depth = 0;
  let line = "";

  const flush = () => {
    if (line.trim()) out.push("  ".repeat(Math.max(0, depth)) + line.trim());
    line = "";
  };

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (!tok.startsWith("<")) {
      line += tok;
      continue;
    }
    const closing = tok.startsWith("</");
    const name = /^<\/?\s*([a-z0-9-]+)/i.exec(tok)?.[1].toLowerCase() ?? "";
    const selfClosing = VOID.has(name) || tok.endsWith("/>") || tok.startsWith("<!");
    const inline = INLINE.has(name);

    if (inline) {
      line += tok;
      continue;
    }
    if (closing) {
      // A text-only element closes on the same line as its content.
      if (line.trim()) {
        const last = out[out.length - 1];
        const openTagOnLast = last && /<[a-z][^>]*>$/i.test(last) && !/<\/.+>$/.test(last);
        if (openTagOnLast && !selfClosing) {
          out[out.length - 1] = `${last}${line.trim()}${tok}`;
          line = "";
          depth = Math.max(0, depth - 1);
          continue;
        }
        flush();
      }
      depth = Math.max(0, depth - 1);
      out.push("  ".repeat(depth) + tok);
      continue;
    }
    flush();
    out.push("  ".repeat(depth) + tok);
    if (!selfClosing) depth++;
  }
  flush();
  return out.join("\n");
}

/** A section's rendered markup, cleaned and formatted for editing. */
export function readableSectionHtml(rendered: string): string {
  let html = rendered
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<template\b[\s\S]*?<\/template\s*>/gi, "")
    // Hydration / framework attributes.
    .replace(
      /\s(data-reveal|data-nimg|data-precedence|data-href|decoding|fetchpriority|srcset|sizes|loading|tabindex)="[^"]*"/g,
      ""
    )
    .replace(/\sstyle="color:\s*transparent"/g, "")
    .replace(/\saria-hidden="false"/g, "");
  // /_next/image?url=%2Fproducts%2Fa.png&w=640&q=75 → /products/a.png
  html = html.replace(
    /(src|href)="\/_next\/image\?url=([^&"]+)[^"]*"/g,
    (_m, attr: string, url: string) => {
      try {
        return `${attr}="${decodeURIComponent(url)}"`;
      } catch {
        return _m;
      }
    }
  );
  return formatHtml(html);
}
