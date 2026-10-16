import { PAGE_LAYOUTS } from "@/design/layouts";
import {
  LOOKS_SECTIONS,
  SECTIONS_BY_TARGET,
  resolveLayout,
  visibleEntries,
  withEditorialExamples,
  type LayoutEntry,
  type PageTarget,
} from "@/lib/page-layout";
import { templateBody } from "@/lib/page-templates";

/** A page's layout as defined in code (src/design/layouts.ts); null means the
 *  page's built-in layout. Nothing is read from the database. */
export function getStoredLayout(target: PageTarget): unknown {
  return PAGE_LAYOUTS[target] ?? null;
}

/** The visible sections to render for a page, in order. */
export async function pageEntries(
  target: PageTarget,
  opts: { hidden?: readonly string[] } = {}
): Promise<LayoutEntry[]> {
  const stored = getStoredLayout(target);
  const sections = SECTIONS_BY_TARGET[target];
  const resolved = visibleEntries(stored, sections, opts.hidden ?? []);
  // The editorial examples are part of the home page's look: any example the
  // layout doesn't mention yet is added; one it already has (or has removed)
  // is left exactly as it is.
  if (target !== "home") return resolved;
  return withEditorialExamples(resolved, (templateId) => templateBody(templateId));
}

/** The look layout and tuning (style, accent, density, alignment, button) of
 *  the Looks page. The home page's Looks section follows it, so both pages
 *  always show the same template. */
export async function getSharedLookOptions(): Promise<Record<string, string>> {
  const entries = resolveLayout(getStoredLayout("looks"), LOOKS_SECTIONS);
  return entries.find((entry) => entry.id === "list")?.options ?? {};
}
