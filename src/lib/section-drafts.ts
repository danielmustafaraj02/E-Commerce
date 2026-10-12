import {
  resolveLayout,
  SECTIONS_BY_TARGET,
  type LayoutEntry,
  type PageTarget,
} from "@/lib/page-layout";

/**
 * A section's work in progress, kept apart from the live site. The editor
 * autosaves it; Publish copies it onto the page and deletes it. Stored as JSON
 * in the PageLayout table under a reserved key (like the version history in
 * section-versions.ts), which the storefront never reads: it only ever loads a
 * page's own key (page-layout-store.ts).
 */
export type SectionDraft = { at: string; entry: LayoutEntry };

export const DRAFT_KEY_PREFIX = "sec-draft:";
export const draftKey = (target: PageTarget, id: string) => `${DRAFT_KEY_PREFIX}${target}:${id}`;

/** The section ids with a draft, from the keys stored for one page. */
export function draftedSectionIds(keys: string[], target: PageTarget): string[] {
  const prefix = `${DRAFT_KEY_PREFIX}${target}:`;
  return keys.filter((key) => key.startsWith(prefix)).map((key) => key.slice(prefix.length));
}

/** A stored draft, validated like any saved section; null when there is none
 *  or it no longer fits the section (it is then simply ignored). */
export function parseDraft(value: unknown, target: PageTarget, id: string): SectionDraft | null {
  if (!value || typeof value !== "object") return null;
  const { at, entry } = value as { at?: unknown; entry?: unknown };
  if (typeof at !== "string" || Number.isNaN(Date.parse(at))) return null;
  if (!entry || typeof entry !== "object") return null;
  const [clean] = resolveLayout([{ ...(entry as object), id }], SECTIONS_BY_TARGET[target]).filter(
    (e) => e.id === id
  );
  return clean ? { at, entry: clean } : null;
}
