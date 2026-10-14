import { requireAdmin } from "@/lib/require-admin";
import {
  PAGE_TARGETS,
  PREVIEW_PATHS,
  SECTIONS_BY_TARGET,
  resolveLayout,
  withEditorialExamples,
  type PageTarget,
} from "@/lib/page-layout";
import { getStoredLayout } from "@/lib/page-layout-store";
import { templateBody } from "@/lib/page-templates";
import { db } from "@/lib/db";
import { loadSavedTemplates } from "@/lib/section-templates-db";
import { defaultLocale } from "@/lib/i18n/locale-constants";
import { getAllArticles } from "@/lib/journal/db-articles";
import { flatSiteText } from "@/lib/builder-i18n-server";
import { DRAFT_KEY_PREFIX, draftedSectionIds } from "@/lib/section-drafts";
import { PageLayoutEditor, type LayoutVersion, type PageData } from "./page-layout-editor";

// Every save is already in the audit log with the layout it stored, so the
// editor can offer the last few as restore points without any extra table.
async function recentVersions(target: PageTarget): Promise<LayoutVersion[]> {
  const sections = SECTIONS_BY_TARGET[target];
  const field =
    target === "home" ? "homeLayout" : target === "product" ? "productPageLayout" : "layout";
  const rows = await db.auditLog.findMany({
    where: { action: `settings.page_layout.${target}`, afterData: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, createdAt: true, afterData: true },
  });
  return rows.flatMap((row) => {
    try {
      const stored = (JSON.parse(row.afterData!) as Record<string, unknown>)[field];
      return stored
        ? [{ id: row.id, at: row.createdAt.toISOString(), layout: resolveLayout(stored, sections) }]
        : [];
    } catch {
      return [];
    }
  });
}

// Admin > Settings > Page layout: order, visibility and design of the sections
// on the home page, product pages and the other storefront pages.
export default async function AdminPageLayoutPage() {
  await requireAdmin();
  const [product, category, savedTemplates, articles, siteText, draftRows] = await Promise.all([
    db.product.findFirst({
      where: { active: true, unlisted: false },
      orderBy: { createdAt: "desc" },
      select: { slug: true },
    }),
    db.category.findFirst({ orderBy: { name: "asc" }, select: { slug: true } }),
    loadSavedTemplates(),
    getAllArticles(),
    flatSiteText(defaultLocale),
    // Sections with unpublished work (lib/section-drafts.ts).
    db.pageLayout
      .findMany({ where: { target: { startsWith: DRAFT_KEY_PREFIX } }, select: { target: true } })
      .catch(() => []),
  ]);
  const draftKeys = draftRows.map((row) => row.target);

  const pages: PageData[] = await Promise.all(
    PAGE_TARGETS.map(async (target) => {
      const path = PREVIEW_PATHS[target]
        .replace("{product}", product?.slug ?? "")
        .replace("{category}", category?.slug ?? "")
        .replace("{article}", articles[0]?.slug ?? "");
      const missingSample =
        path.endsWith("/") &&
        (target === "product" || target === "category" || target === "article");
      const layout = resolveLayout(await getStoredLayout(target), SECTIONS_BY_TARGET[target]);
      return {
        target,
        // The editorial examples are part of the home page's starting look, so
        // they are listed here too, and each can be deleted like any section.
        layout:
          target === "home"
            ? withEditorialExamples(layout, (templateId) => templateBody(templateId))
            : layout,
        versions: await recentVersions(target),
        drafts: draftedSectionIds(draftKeys, target),
        previewUrl: missingSample ? null : `/${defaultLocale}${path}?layoutPreview=1`,
      };
    })
  );

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Page layout</h1>
      <p className="mb-6 max-w-2xl text-sm text-neutral-600">
        Each page as the sections it shows. Drag them into order, hide the ones you don&apos;t
        want, and open any section to redesign it.
      </p>
      <PageLayoutEditor pages={pages} savedTemplates={savedTemplates} siteText={siteText} />
    </div>
  );
}
