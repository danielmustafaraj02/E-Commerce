// A plain `.slice(0, n)` meta description cuts mid-word ("...craqu") which
// looks broken in a search snippet — this backs off to the last full word
// instead, so truncated copy still reads as a real sentence fragment.
export function truncateAtWord(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…";
}

// Admin-entered copy (category descriptions) is plain text; a blank line starts
// a new paragraph.
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function firstParagraph(text: string): string {
  return paragraphs(text)[0] ?? "";
}
