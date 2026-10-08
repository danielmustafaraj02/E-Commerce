import {
  resolveLayout,
  SECTIONS_BY_TARGET,
  type LayoutEntry,
  type PageTarget,
} from "@/lib/page-layout";

/** The last saved versions of one section, newest first. Stored as JSON in the
 *  PageLayout table under a reserved key, so no migration is needed. */
export type SectionVersion = { at: string; entry: LayoutEntry };

export const MAX_SECTION_VERSIONS = 12;
export const versionsKey = (target: PageTarget, id: string) => `sec-hist:${target}:${id}`;

export function parseVersions(value: unknown, target: PageTarget, id: string): SectionVersion[] {
  if (!Array.isArray(value)) return [];
  const sections = SECTIONS_BY_TARGET[target];
  return value
    .flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const { at, entry } = item as { at?: unknown; entry?: unknown };
      if (typeof at !== "string" || Number.isNaN(Date.parse(at))) return [];
      const [clean] = resolveLayout([{ ...(entry as object), id }], sections).filter(
        (e) => e.id === id
      );
      return clean ? [{ at, entry: clean }] : [];
    })
    .slice(0, MAX_SECTION_VERSIONS);
}

/** Pushes the previous version in front, skipping a repeat of the newest one. */
export function withVersion(
  existing: SectionVersion[],
  entry: LayoutEntry,
  now = new Date()
): SectionVersion[] {
  const same = existing[0] && JSON.stringify(existing[0].entry) === JSON.stringify(entry);
  const next = same ? existing : [{ at: now.toISOString(), entry }, ...existing];
  return next.slice(0, MAX_SECTION_VERSIONS);
}
