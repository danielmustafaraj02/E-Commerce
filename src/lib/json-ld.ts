// JSON.stringify doesn't escape `<`, so admin-editable content (product
// name/description, store settings) containing a literal `</script>` would
// otherwise break out of the JSON-LD <script> tag it's injected into via
// dangerouslySetInnerHTML and inject executable markup — a stored-XSS class
// affecting every visitor of the page. Escaping the angle brackets (plus the
// two JS line-terminator code points, for safety) keeps the JSON
// value-identical while making it inert as HTML.
const LINE_SEPARATOR = String.fromCharCode(8232);
const PARAGRAPH_SEPARATOR = String.fromCharCode(8233);

export function toSafeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .split(LINE_SEPARATOR)
    .join("\\u2028")
    .split(PARAGRAPH_SEPARATOR)
    .join("\\u2029");
}

// schema.org (and Google) want absolute URLs; admin-entered logo/image paths are
// often site-relative ("/logo.png"). Leaves already-absolute URLs alone, and
// returns the input unchanged when the site URL isn't known.
export function absoluteUrl(url: string, base: string): string {
  if (!base || /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith("//")) return url;
  return `${base.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;
}

// The seed's placeholder company details must never be published as real
// structured data.
export function isPlaceholderCompany(name: string | null | undefined): boolean {
  return !name || /^demo store\b/i.test(name.trim());
}
