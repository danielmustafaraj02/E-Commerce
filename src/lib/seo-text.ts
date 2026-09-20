import { truncateAtWord } from "@/lib/text";

// Search engines show roughly the first 60 characters of a <title>. The root
// layout's title template appends " | {storeName}" to any *string* title, so a
// page title only fits if `title + separator + storeName` does.
export const TITLE_MAX = 60;
const TITLE_SEPARATOR = " | ";

// Picks the first candidate that still fits once the brand is appended (order
// candidates from most to least descriptive). If even the shortest doesn't fit,
// drop the brand (`absolute` opts out of the template) rather than let the
// name get cut off; only a name that is itself too long is truncated.
export function fitTitle(candidates: string[], storeName: string): string | { absolute: string } {
  for (const candidate of candidates) {
    if (candidate.length + TITLE_SEPARATOR.length + storeName.length <= TITLE_MAX) return candidate;
  }
  const shortest = candidates[candidates.length - 1];
  return { absolute: truncateAtWord(shortest, TITLE_MAX) };
}

const SENTENCE_BREAK = /(?<=[.!?])\s+|(?<=[。！？])/;
const CLAUSE_BREAKS = [", ", "; ", ": ", " — ", " – ", "、", "，"];

// A meta description that reads as finished copy, ends with the price and a
// call to action (both lift click-through in product snippets), and fits the
// ~155 characters search engines show — instead of a description chopped
// mid-sentence.
//
// The copy is trimmed to whole sentences when possible; a single sentence that
// is too long is cut at a clause boundary, else at a word.
export function buildProductMetaDescription({
  description,
  suffix,
  max = 155,
}: {
  description: string;
  suffix: string;
  max?: number;
}): string {
  const text = description.replace(/\s+/g, " ").trim();
  if (!text) return suffix;

  const budget = max - suffix.length - 1; // 1 = the space before the suffix
  if (text.length <= budget) return `${text} ${suffix}`;

  let body = "";
  for (const sentence of text.split(SENTENCE_BREAK)) {
    const next = body ? `${body} ${sentence}` : sentence;
    if (next.length > budget) break;
    body = next;
  }

  if (!body) {
    const cut = text.slice(0, budget - 1); // leave room for the ellipsis
    const clause = Math.max(...CLAUSE_BREAKS.map((mark) => cut.lastIndexOf(mark)));
    const word = cut.lastIndexOf(" ");
    // A clause boundary is a natural stopping point, so accept one that keeps
    // 40% of the budget rather than cutting at an arbitrary word (which tends to
    // strand "...and a"). Else a word, else (unspaced scripts) cut hard.
    const at = clause > budget * 0.4 ? clause : word > budget * 0.5 ? word : cut.length;
    body = cut.slice(0, at).replace(/[\s,;:—–、，-]+$/, "") + "…";
  }
  return `${body} ${suffix}`;
}
