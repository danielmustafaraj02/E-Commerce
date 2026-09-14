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
