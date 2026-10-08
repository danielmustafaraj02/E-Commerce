import { cache } from "react";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import {
  SECTIONS_BY_TARGET,
  resolveLayout,
  visibleEntries,
  withEditorialExamples,
  type LayoutEntry,
  type PageTarget,
} from "@/lib/page-layout";
import { templateBody } from "@/lib/page-templates";

/** The saved layout of a page, as stored (null = the built-in layout). Home and
 *  product pages live on StoreSettings, the others in the PageLayout table,
 *  which may not exist yet: that simply means the built-in layout. */
export const getStoredLayout = cache(async (target: PageTarget): Promise<unknown> => {
  if (target === "home") return (await getStoreSettings()).homeLayout;
  if (target === "product") return (await getStoreSettings()).productPageLayout;
  try {
    const row = await db.pageLayout.findUnique({ where: { target }, select: { layout: true } });
    return row?.layout ?? null;
  } catch {
    return null;
  }
});

/** The sections to render for a page, in order. In admin preview every section
 *  is returned (hidden ones too) so the preview can show and move them. */
export async function pageEntries(
  target: PageTarget,
  opts: { preview?: boolean; hidden?: readonly string[] } = {}
): Promise<LayoutEntry[]> {
  const stored = await getStoredLayout(target);
  const sections = SECTIONS_BY_TARGET[target];
  const resolved = opts.preview
    ? resolveLayout(stored, sections)
    : visibleEntries(stored, sections, opts.hidden ?? []);
  // The editorial examples are part of the home page's starting look, so the
  // admin list shows them too (and can delete each one). Same rule as the
  // storefront: an example already in the saved layout is left exactly as it
  // is, so a deleted one does not come back.
  if (target !== "home") return resolved;
  return withEditorialExamples(resolved, (templateId) => templateBody(templateId));
}
