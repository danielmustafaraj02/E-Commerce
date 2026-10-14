import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { defaultLocale } from "@/lib/i18n/locale-constants";
import {
  PREVIEW_PATHS,
  SECTIONS_BY_TARGET,
  isPageTarget,
  resolveLayout,
  withEditorialExamples,
} from "@/lib/page-layout";
import { getStoredLayout } from "@/lib/page-layout-store";
import { templateBody } from "@/lib/page-templates";
import { loadSavedTemplates } from "@/lib/section-templates-db";
import { SectionEditor } from "../../section-editor";
import { loadBlockPresets } from "../../actions";
import { flatSiteText } from "@/lib/builder-i18n-server";
import { getAllArticles } from "@/lib/journal/db-articles";
import { loadSectionDesignTemplates } from "../../actions";
import { draftKey, parseDraft } from "@/lib/section-drafts";

// Admin > Settings > Page layout > (a section): design one section with the
// visual builder, its HTML, or its style, with a live preview.
export default async function SectionEditorPage({
  params,
}: PageProps<"/admin/settings/page-layout/[target]/[id]">) {
  await requireAdmin();
  const { target, id } = await params;
  if (!isPageTarget(target)) notFound();

  const sections = SECTIONS_BY_TARGET[target];
  const stored = resolveLayout(await getStoredLayout(target), sections);
  // The editorial examples are seeded at render time on the home page (see
  // page-layout.ts) and listed by the layout editor, so the section editor must
  // seed them the same way — otherwise opening one of those sections 404s.
  const layout =
    target === "home"
      ? withEditorialExamples(stored, (templateId) => templateBody(templateId))
      : stored;
  const entry = layout.find((e) => e.id === id);
  if (!entry) notFound();

  const meta = sections.find((s) => s.id === id);
  if (meta && "managedIn" in meta && meta.managedIn) {
    return (
      <div className="max-w-xl rounded-lg border bg-white p-6">
        <h1 className="mb-2 text-lg font-semibold">{meta.label}</h1>
        <p className="mb-4 text-sm text-neutral-600">
          This part is designed in one place only, so there is never a second setting fighting it.
          Choose its template and drag its title, text and photo there.
        </p>
        <Link href={meta.managedIn.href} className="rounded bg-neutral-900 px-4 py-2 text-sm text-white">
          Open {meta.managedIn.label}
        </Link>
      </div>
    );
  }
  const [savedTemplates, blockPresets, siteText, sectionTemplates, draftRow] = await Promise.all([
    loadSavedTemplates(),
    loadBlockPresets(),
    flatSiteText(defaultLocale),
    loadSectionDesignTemplates(target, id),
    // The work in progress, if any (lib/section-drafts.ts).
    db.pageLayout
      .findUnique({ where: { target: draftKey(target, id) }, select: { layout: true } })
      .catch(() => null),
  ]);

  // The page the preview opens: a sample product / category where the page needs one.
  const [product, category, articles] = await Promise.all([
    target === "product"
      ? db.product.findFirst({
          where: { active: true, unlisted: false },
          orderBy: { createdAt: "desc" },
          select: { slug: true },
        })
      : null,
    target === "category"
      ? db.category.findFirst({ orderBy: { name: "asc" }, select: { slug: true } })
      : null,
    target === "article" ? getAllArticles() : [],
  ]);
  const path = PREVIEW_PATHS[target]
    .replace("{product}", product?.slug ?? "")
    .replace("{category}", category?.slug ?? "")
    .replace("{article}", articles[0]?.slug ?? "");
  const needsSample = target === "product" || target === "category" || target === "article";
  const previewUrl =
    needsSample && path.endsWith("/") ? null : `/${defaultLocale}${path}?layoutPreview=1`;

  return (
    <SectionEditor
      target={target}
      initial={entry}
      draft={parseDraft(draftRow?.layout, target, id)}
      label={entry.custom?.name ?? meta?.label ?? id}
      hint={meta?.hint ?? "Custom section"}
      previewUrl={previewUrl}
      options={meta?.options}
      fixed={meta?.fixed}
      savedTemplates={savedTemplates}
      sectionTemplates={sectionTemplates}
      blockPresets={blockPresets}
      siteText={siteText}
    />
  );
}
