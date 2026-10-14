"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";
import {
  EDITORIAL_SEED_NAMES,
  PAGE_TARGETS,
  PAGE_LABELS,
  SECTIONS_BY_TARGET,
  isPageTarget,
  isEditorialSeed,
  parseStyle,
  resolveLayout,
  type LayoutEntry,
  type PageTarget,
  type SectionStyle,
} from "@/lib/page-layout";
import { SECTION_TEMPLATES } from "@/lib/section-templates";
import { parseBuilder, type BuilderDoc } from "@/lib/section-builder";
import { ALL_TEMPLATES } from "@/lib/page-templates";
import { loadSavedTemplates } from "@/lib/section-templates-db";
import {
  BLOCK_PRESETS_KEY,
  MAX_BLOCK_PRESETS,
  cleanLook,
  parsePresets,
  type BlockPreset,
} from "@/lib/block-presets";
import {
  parseVersions,
  versionsKey,
  withVersion,
  type SectionVersion,
} from "@/lib/section-versions";
import { draftKey, parseDraft } from "@/lib/section-drafts";

export type PageLayoutState = { ok?: string; error?: string };

type Target = PageTarget;
const sectionsFor = (target: Target) => SECTIONS_BY_TARGET[target];
/** The key a target's layout is stored under in the audit log's snapshot. */
const fieldFor = (target: Target) =>
  target === "home" ? "homeLayout" : target === "product" ? "productPageLayout" : "layout";

async function readStored(target: Target) {
  if (target !== "home" && target !== "product") {
    let stored: unknown;
    try {
      stored = (await db.pageLayout.findUnique({ where: { target } }))?.layout;
    } catch {
      stored = undefined;
    }
    return {
      id: undefined as string | undefined,
      layout: resolveLayout(stored, sectionsFor(target)),
    };
  }
  const settings = await db.storeSettings.findFirst({
    select: { id: true, homeLayout: true, productPageLayout: true },
  });
  const stored = settings?.[fieldFor(target) as "homeLayout" | "productPageLayout"];
  return { id: settings?.id, layout: resolveLayout(stored, sectionsFor(target)) };
}

async function writeLayout(
  userId: string,
  target: Target,
  layout: LayoutEntry[],
  action: string,
  storeId: string | undefined,
  detail?: unknown
) {
  const json = layout as unknown as Prisma.InputJsonValue;
  if (target !== "home" && target !== "product") {
    try {
      await db.pageLayout.upsert({
        where: { target },
        create: { target, layout: json },
        update: { layout: json },
      });
    } catch (error) {
      console.error("Page layout not saved", error);
      throw new Error(
        "The page layouts table is missing: the database needs its latest migration."
      );
    }
    await writeAuditLog({
      userId,
      action,
      entityType: "PageLayout",
      entityId: target,
      after: { layout },
      ...(detail !== undefined && { before: detail }),
    });
  } else {
    const data = target === "home" ? { homeLayout: json } : { productPageLayout: json };
    if (storeId) {
      await db.storeSettings.update({ where: { id: storeId }, data });
    } else {
      await db.storeSettings.create({ data });
    }
    await writeAuditLog({
      userId,
      action,
      entityType: "StoreSettings",
      entityId: storeId,
      after: data,
      ...(detail !== undefined && { before: detail }),
    });
  }
  // Revalidate the storefront page(s) this target controls.
  const targetPaths: Record<Target, string[]> = {
    home: ["/"],
    product: ["/products/[slug]"],
    about: ["/about"],
    contact: ["/contact"],
    looks: ["/looks"],
    journal: ["/blog"],
    article: ["/blog/[slug]"],
    category: ["/category/[slug]"],
    products: ["/products"],
  };
  for (const path of targetPaths[target] ?? ["/"]) {
    revalidatePath(path, "page");
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings/page-layout");
}

const listSchema = z.object({
  target: z.enum(PAGE_TARGETS),
  // JSON array of { id, visible, … }; normalised below, so unknown ids are dropped.
  layout: z.string().max(2_000_000),
  // "keep": take order and visibility from the list but every section's content
  // from what is saved (so a stale list can never overwrite a section edited on
  // its own page). "replace": restore a saved version as it was.
  mode: z.enum(["keep", "replace"]).default("keep"),
});

/** Saves the list editor: order, visibility (and, for a restored version, content). */
export async function savePageLayout(
  _prev: PageLayoutState,
  formData: FormData
): Promise<PageLayoutState> {
  const session = await requireAdmin();
  const parsed = listSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid layout." };

  let raw: unknown;
  try {
    raw = JSON.parse(parsed.data.layout);
  } catch {
    return { error: "Invalid layout." };
  }

  const target = parsed.data.target;
  const sections = sectionsFor(target);
  const incoming = resolveLayout(raw, sections);
  const stored = await readStored(target);
  const byId = new Map(stored.layout.map((e) => [e.id, e]));
  const layout =
    parsed.data.mode === "replace"
      ? incoming
      : incoming.flatMap((entry) => {
          const current = byId.get(entry.id);
          // Built-in sections always exist; a custom one missing from storage
          // was deleted elsewhere and stays deleted.
          if (!current) return entry.custom ? [] : [entry];
          return [{ ...current, visible: entry.visible }];
        });

  await writeLayout(session.user!.id!, target, layout, `settings.page_layout.${target}`, stored.id);
  return { ok: `${PAGE_LABELS[target]} layout saved.` };
}

/** Back to the built-in order (stores NULL, so future sections appear too). */
export async function resetPageLayout(target: Target): Promise<PageLayoutState> {
  const session = await requireAdmin();
  let entityType = "StoreSettings";
  let entityId: string | undefined;
  if (target === "home" || target === "product") {
    const data =
      target === "home" ? { homeLayout: Prisma.DbNull } : { productPageLayout: Prisma.DbNull };
    const existing = await db.storeSettings.findFirst({ select: { id: true } });
    if (existing) await db.storeSettings.update({ where: { id: existing.id }, data });
    entityId = existing?.id;
  } else {
    await db.pageLayout.deleteMany({ where: { target } }).catch(() => undefined);
    entityType = "PageLayout";
    entityId = target;
  }

  await writeAuditLog({
    userId: session.user!.id!,
    action: `settings.page_layout.${target}.reset`,
    entityType,
    entityId,
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings/page-layout");
  return { ok: "Restored the default layout." };
}

/** Saves ONE section from its own editor page, leaving the rest of the layout
 *  (order, visibility, other sections) exactly as stored. */
export async function saveSectionEntry(
  target: Target,
  id: string,
  entryJson: string
): Promise<PageLayoutState> {
  const session = await requireAdmin();
  if (entryJson.length > 600_000) return { error: "This section is too large." };
  let raw: unknown;
  try {
    raw = JSON.parse(entryJson);
  } catch {
    return { error: "Invalid section." };
  }
  const sections = sectionsFor(target);
  const [incoming] = resolveLayout([{ ...(raw as object), id }], sections).filter(
    (e) => e.id === id
  );
  if (!incoming) return { error: "Unknown section." };

  const stored = await readStored(target);
  const current = stored.layout.find((e) => e.id === id);
  // Visibility is managed on the list, not here.
  const next = { ...incoming, visible: current?.visible ?? true };
  const layout = current
    ? stored.layout.map((e) => (e.id === id ? next : e))
    : [...stored.layout, next];

  await writeLayout(session.user!.id!, target, layout, `settings.page_layout.${target}`, stored.id);
  // Keep the version this save replaced, so it can be restored later.
  if (current) {
    try {
      const key = versionsKey(target, id);
      const row = await db.pageLayout.findUnique({
        where: { target: key },
        select: { layout: true },
      });
      const versions = withVersion(parseVersions(row?.layout, target, id), current);
      const json = versions as unknown as Prisma.InputJsonValue;
      await db.pageLayout.upsert({
        where: { target: key },
        create: { target: key, layout: json },
        update: { layout: json },
      });
    } catch (error) {
      console.error("Section version not kept", error);
    }
  }
  // What was being worked on is now the live version.
  await db.pageLayout
    .deleteMany({ where: { target: draftKey(target, id) } })
    .catch((error) => console.error("Published draft not cleared", error));
  return { ok: "Published." };
}

const isSectionId = (id: unknown): id is string =>
  typeof id === "string" && /^[\w-]{1,80}$/.test(id);

/**
 * Autosave: the editor's work in progress, kept off the live site until it
 * is published (lib/section-drafts.ts). Not written to the audit log; the
 * publish that follows is.
 */
export async function saveSectionDraft(
  target: Target,
  id: string,
  entryJson: string
): Promise<{ at?: string; error?: string }> {
  await requireAdmin();
  if (!isPageTarget(target) || !isSectionId(id)) return { error: "Unknown section." };
  if (typeof entryJson !== "string" || entryJson.length > 600_000)
    return { error: "This section is too large." };
  let raw: unknown;
  try {
    raw = JSON.parse(entryJson);
  } catch {
    return { error: "Invalid section." };
  }
  const draft = parseDraft({ at: new Date().toISOString(), entry: raw }, target, id);
  if (!draft) return { error: "Unknown section." };
  try {
    const key = draftKey(target, id);
    const json = draft as unknown as Prisma.InputJsonValue;
    await db.pageLayout.upsert({
      where: { target: key },
      create: { target: key, layout: json },
      update: { layout: json },
    });
    return { at: draft.at };
  } catch (error) {
    console.error("Draft not saved", error);
    return { error: "The draft could not be saved. Your changes are still here." };
  }
}

/** Throws the work in progress away; the live version stays as it is. */
export async function discardSectionDraft(target: Target, id: string): Promise<PageLayoutState> {
  await requireAdmin();
  if (!isPageTarget(target) || !isSectionId(id)) return { error: "Unknown section." };
  await db.pageLayout.deleteMany({ where: { target: draftKey(target, id) } });
  return { ok: "Draft thrown away." };
}

/** The earlier saved versions of a section, newest first. */
export async function listSectionVersions(target: Target, id: string): Promise<SectionVersion[]> {
  await requireAdmin();
  try {
    const row = await db.pageLayout.findUnique({
      where: { target: versionsKey(target, id) },
      select: { layout: true },
    });
    return parseVersions(row?.layout, target, id);
  } catch {
    return [];
  }
}

// ---- Saved block looks ("presets") ---------------------------------------------

export async function loadBlockPresets(): Promise<BlockPreset[]> {
  await requireAdmin();
  try {
    const row = await db.pageLayout.findUnique({
      where: { target: BLOCK_PRESETS_KEY },
      select: { layout: true },
    });
    return parsePresets(row?.layout);
  } catch {
    return [];
  }
}

async function writePresets(presets: BlockPreset[]) {
  const json = presets as unknown as Prisma.InputJsonValue;
  await db.pageLayout.upsert({
    where: { target: BLOCK_PRESETS_KEY },
    create: { target: BLOCK_PRESETS_KEY, layout: json },
    update: { layout: json },
  });
}

export type PresetState = { ok?: string; error?: string; presets?: BlockPreset[] };

export async function saveBlockPreset(name: string, lookJson: string): Promise<PresetState> {
  const session = await requireAdmin();
  const title = name.trim().slice(0, 40);
  if (!title) return { error: "Give the look a name." };
  let look;
  try {
    look = cleanLook(JSON.parse(lookJson));
  } catch {
    look = null;
  }
  if (!look) return { error: "This block has no style, effect or animation to save yet." };
  const existing = await loadBlockPresets();
  const others = existing.filter((p) => p.name !== title);
  if (others.length >= MAX_BLOCK_PRESETS)
    return { error: "Delete a saved look first (30 is the limit)." };
  const presets = [{ name: title, look }, ...others];
  try {
    await writePresets(presets);
  } catch {
    return { error: "Could not save. Check the database connection and try again." };
  }
  await writeAuditLog({
    userId: session.user!.id!,
    action: "settings.block_preset.save",
    entityType: "PageLayout",
    entityId: BLOCK_PRESETS_KEY,
    after: { name: title },
  });
  return { ok: `Saved “${title}”.`, presets };
}

export async function deleteBlockPreset(name: string): Promise<PresetState> {
  const session = await requireAdmin();
  const presets = (await loadBlockPresets()).filter((p) => p.name !== name);
  try {
    await writePresets(presets);
  } catch {
    return { error: "Could not delete. Try again." };
  }
  await writeAuditLog({
    userId: session.user!.id!,
    action: "settings.block_preset.delete",
    entityType: "PageLayout",
    entityId: BLOCK_PRESETS_KEY,
    after: { name },
  });
  return { ok: "Deleted.", presets };
}

/** Adds a custom section from a template and opens it in its editor. */
export async function addCustomSection(target: Target, templateId: string) {
  const session = await requireAdmin();
  const saved = (await loadSavedTemplates()).find((t) => t.id === templateId);
  const template =
    saved ?? ALL_TEMPLATES.find((t) => t.id === templateId) ?? SECTION_TEMPLATES.at(-1)!;
  const id = `custom-${Math.random().toString(36).slice(2, 8)}`;
  const stored = await readStored(target);
  const layout = resolveLayout(
    [
      ...stored.layout,
      {
        id,
        visible: true,
        custom: { name: template.name, html: "", css: "" },
        builder: template.doc,
        ...("style" in template && template.style ? { style: template.style } : {}),
      },
    ],
    sectionsFor(target)
  );
  await writeLayout(session.user!.id!, target, layout, `settings.page_layout.${target}`, stored.id);
  redirect(`/admin/settings/page-layout/${target}/${id}`);
}

/** Deletes a custom section for good (built-in sections can only be hidden).
 *
 * The five editorial examples ship on the home page, so for those a plain
 * removal is not enough: the next render would see a layout that never
 * mentioned them and seed them again. They are left in place as a hidden
 * tombstone instead — invisible on the site, but enough for
 * `withEditorialExamples` to know the admin took it off the page for good.
 *
 * An editorial seed is only present in `stored.layout` once the layout has been
 * saved at least once; on a fresh page it is absent, so it must be appended as a
 * tombstone here — otherwise the flatMap below matches nothing, the layout is
 * written back unchanged, and the seed simply reappears (delete looks broken). */
export async function deleteCustomSection(target: Target, id: string) {
  const session = await requireAdmin();
  const stored = await readStored(target);
  const seed = target === "home" && isEditorialSeed(id);
  let found = false;
  const layout = stored.layout.flatMap((e) => {
    if (e.id !== id || !e.custom) return [e];
    found = true;
    if (!seed) return [];
    return [{ id, visible: false, custom: { name: e.custom.name, html: "", css: "" } }];
  });
  // The seed was never stored (fresh layout): add the tombstone so the example
  // is not re-seeded on the next render.
  if (seed && !found)
    layout.push({
      id,
      visible: false,
      custom: { name: EDITORIAL_SEED_NAMES[id] ?? "Editorial section", html: "", css: "" },
    });
  await writeLayout(session.user!.id!, target, layout, `settings.page_layout.${target}`, stored.id);
  redirect("/admin/settings/page-layout");
}

/** Saves a section's visual design (and its style) as a reusable template. */
export async function saveSectionTemplate(
  name: string,
  entryJson: string
): Promise<PageLayoutState> {
  const session = await requireAdmin();
  const title = name.trim().slice(0, 60);
  if (!title) return { error: "Give the template a name." };
  let raw: { builder?: unknown; style?: unknown };
  try {
    raw = JSON.parse(entryJson);
  } catch {
    return { error: "Invalid section." };
  }
  const builder = parseBuilder(raw.builder);
  if (!builder) {
    return { error: "Only sections made with the visual editor can be saved as templates." };
  }
  try {
    const row = await db.sectionTemplate.create({
      data: {
        name: title,
        doc: { builder, style: parseStyle(raw.style) ?? null } as unknown as Prisma.InputJsonValue,
      },
    });
    await writeAuditLog({
      userId: session.user!.id!,
      action: "settings.section_template.create",
      entityType: "SectionTemplate",
      entityId: row.id,
      after: { name: title },
    });
  } catch (error) {
    console.error("Section template not saved", error);
    return { error: "Could not save the template (the database may need its latest migration)." };
  }
  revalidatePath("/admin/settings/page-layout", "layout");
  return { ok: `Saved “${title}” as a template.` };
}

export async function deleteSectionTemplate(id: string): Promise<PageLayoutState> {
  const session = await requireAdmin();
  try {
    await db.sectionTemplate.delete({ where: { id } });
    await writeAuditLog({
      userId: session.user!.id!,
      action: "settings.section_template.delete",
      entityType: "SectionTemplate",
      entityId: id,
    });
  } catch {
    return { error: "Could not delete the template." };
  }
  revalidatePath("/admin/settings/page-layout", "layout");
  return { ok: "Template deleted." };
}

// ---- Legacy page-level template actions -----------------------------------------
// Retained briefly for old callers/data. New template editing is section-scoped
// and uses the section-specific action API below.

export type PageTemplateRecord = {
  id: string;
  slot: number;
  name: string;
  description: string;
  createdAt: string;
};

export type PageTemplatesState = {
  ok?: string;
  error?: string;
  templates?: PageTemplateRecord[];
};

export type SectionDesignTemplateRecord = {
  id: string;
  slot: number;
  name: string;
  description: string;
  doc: BuilderDoc;
  style?: SectionStyle;
};

export type SectionDesignTemplatesState = { ok?: string; error?: string; template?: SectionDesignTemplateRecord };

const sectionTemplateSchema = z.object({
  target: z.enum(PAGE_TARGETS),
  sectionId: z.string().min(1).max(80),
  slot: z.number().int().min(1).max(100),
});

export async function loadSectionDesignTemplates(
  target: PageTarget,
  sectionId: string
): Promise<SectionDesignTemplateRecord[]> {
  await requireAdmin();
  if (!isPageTarget(target) || !SECTIONS_BY_TARGET[target].some((section) => section.id === sectionId)) return [];
  try {
    const rows = await db.pageTemplate.findMany({
      where: { target, sectionId },
      orderBy: { slot: "asc" },
      select: { id: true, slot: true, name: true, description: true, doc: true },
    });
    return rows.flatMap((row) => {
      const raw = row.doc as { builder?: unknown; style?: unknown };
      const doc = parseBuilder(raw?.builder);
      if (!doc) return [];
      return [{ id: row.id, slot: row.slot, name: `Template ${row.slot}`, description: row.description, doc, style: parseStyle(raw.style) }];
    });
  } catch {
    return [];
  }
}

export async function saveSectionDesignTemplate(input: {
  target: PageTarget;
  sectionId: string;
  slot: number;
  name: string;
  description: string;
  doc: string;
}): Promise<SectionDesignTemplatesState> {
  const session = await requireAdmin();
  const checked = sectionTemplateSchema.safeParse(input);
  if (!checked.success || !SECTIONS_BY_TARGET[input.target]?.some((section) => section.id === input.sectionId))
    return { error: "Invalid section template." };
  let raw: { builder?: unknown; style?: unknown };
  try { raw = JSON.parse(input.doc) as { builder?: unknown; style?: unknown }; }
  catch { return { error: "Invalid design data." }; }
  const builder = parseBuilder(raw.builder);
  if (!builder) return { error: "Only visual-builder designs can be saved as section templates." };
  const description = input.description.trim().slice(0, 300);
  const safeStyle = parseStyle(raw.style);
  try {
    const row = await db.pageTemplate.upsert({
      where: { target_sectionId_slot: { target: input.target, sectionId: input.sectionId, slot: input.slot } },
      create: {
        target: input.target,
        sectionId: input.sectionId,
        slot: input.slot,
        name: `Template ${input.slot}`,
        description,
        doc: { builder, style: safeStyle ?? null } as unknown as Prisma.InputJsonValue,
      },
      update: {
        name: `Template ${input.slot}`,
        description,
        doc: { builder, style: safeStyle ?? null } as unknown as Prisma.InputJsonValue,
      },
      select: { id: true, slot: true },
    });
    await writeAuditLog({
      userId: session.user!.id!,
      action: "settings.section_design_template.save",
      entityType: "PageTemplate",
      entityId: `${input.target}:${input.sectionId}:${input.slot}`,
      after: { target: input.target, sectionId: input.sectionId, slot: input.slot, description },
    });
    revalidatePath(`/admin/settings/page-layout/${input.target}/${input.sectionId}`);
    return { ok: `Template ${input.slot} salvato.`, template: { ...row, name: `Template ${row.slot}`, description, doc: builder, style: safeStyle } };
  } catch {
    return { error: "Impossibile salvare il template: applica le migrazioni del database." };
  }
}

export async function updateSectionDesignTemplateDescription(id: string, description: string) {
  const session = await requireAdmin();
  try {
    const record = await db.pageTemplate.findUnique({ where: { id }, select: { target: true, sectionId: true, slot: true } });
    if (!record) return { error: "Template non trovato." };
    const text = description.trim().slice(0, 300);
    await db.pageTemplate.update({ where: { id }, data: { description: text, name: `Template ${record.slot}` } });
    await writeAuditLog({ userId: session.user!.id!, action: "settings.section_design_template.description", entityType: "PageTemplate", entityId: id, after: { description: text } });
    revalidatePath(`/admin/settings/page-layout/${record.target}/${record.sectionId}`);
    return { ok: "Descrizione aggiornata." };
  } catch { return { error: "Impossibile aggiornare la descrizione." }; }
}

export async function deleteSectionDesignTemplate(id: string) {
  const session = await requireAdmin();
  try {
    const record = await db.pageTemplate.delete({ where: { id }, select: { target: true, sectionId: true } });
    await writeAuditLog({ userId: session.user!.id!, action: "settings.section_design_template.delete", entityType: "PageTemplate", entityId: id });
    revalidatePath(`/admin/settings/page-layout/${record.target}/${record.sectionId}`);
    return { ok: "Template eliminato." };
  } catch { return { error: "Impossibile eliminare il template." }; }
}

/** Legacy full-page templates are intentionally disabled; templates belong to sections. */
export async function loadPageTemplates(_target: Target): Promise<PageTemplateRecord[]> {
  await requireAdmin();
  return [];
}

/** Save the current layout as a named template in the given slot.
 *  If a template already exists for that slot it is overwritten. */
export async function savePageTemplate(
  _target: Target,
  _slot: number,
  _description: string,
  _layoutJson: string
): Promise<PageTemplatesState> {
  await requireAdmin();
  return { error: "I template si salvano per singola sezione, non per pagina intera." };
}

/** Update only the description of an existing template (without overwriting the layout). */
export async function updatePageTemplateDescription(
  _id: string,
  _description: string
): Promise<PageTemplatesState> {
  await requireAdmin();
  return { error: "I template si modificano nella sezione a cui appartengono." };
}

/** Full-page template loading is retired: every template now belongs to one section. */
export async function applyPageTemplate(_id: string): Promise<{ layout?: LayoutEntry[]; error?: string }> {
  await requireAdmin();
  return { error: "Apri la sezione per scegliere o caricare uno dei suoi template." };
}

/** Full-page template deletion is retired in favour of section-level management. */
export async function deletePageTemplate(_id: string): Promise<PageTemplatesState> {
  await requireAdmin();
  return { error: "I template si eliminano dalla sezione a cui appartengono." };
}

/** Copies a section's saved design to the other page (home ⇄ product pages) as
 *  a new custom section, then opens it there. Only returns on error. */
export async function copySectionToOtherPage(
  target: Target,
  id: string,
  label: string,
  other: Target
): Promise<PageLayoutState> {
  const session = await requireAdmin();
  if (other === target) return { error: "Choose a different page to copy to." };
  const source = (await readStored(target)).layout.find((e) => e.id === id);
  if (!source) return { error: "Section not found." };

  const name = `${(source.custom?.name ?? label).slice(0, 52)} (copy)`;
  let copy: Omit<LayoutEntry, "id" | "visible">;
  if (source.custom) {
    copy = { custom: { ...source.custom, name }, builder: source.builder, style: source.style };
  } else if (source.builder) {
    copy = { custom: { name, html: "", css: "" }, builder: source.builder, style: source.style };
  } else if (source.html !== undefined) {
    const { css, ...style } = source.style ?? {};
    copy = {
      custom: { name, html: source.html, css: css ?? "" },
      style: Object.keys(style).length ? style : undefined,
    };
  } else {
    return {
      error:
        "This is the untouched built-in section, which only exists on its own page. Customise it first (or start from a template), then copy it.",
    };
  }

  const newId = `custom-${Math.random().toString(36).slice(2, 8)}`;
  const stored = await readStored(other);
  const layout = resolveLayout(
    [...stored.layout, { id: newId, visible: true, ...copy }],
    sectionsFor(other)
  );
  if (!layout.some((e) => e.id === newId)) {
    return { error: "The other page already has the maximum number of custom sections." };
  }
  await writeLayout(session.user!.id!, other, layout, `settings.page_layout.${other}`, stored.id);
  redirect(`/admin/settings/page-layout/${other}/${newId}`);
}
