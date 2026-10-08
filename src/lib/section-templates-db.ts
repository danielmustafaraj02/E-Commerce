import { db } from "@/lib/db";
import { parseStyle, type SectionStyle } from "@/lib/page-layout";
import { parseBuilder, type BuilderDoc, type SectionTemplate } from "@/lib/section-builder";

/** A template the admin saved from one of their own sections. */
export type SavedTemplate = SectionTemplate & { saved: true; style?: SectionStyle };

/** Saved templates, newest first. Never throws: without the table (migration
 *  not applied yet) there are simply none. */
export async function loadSavedTemplates(): Promise<SavedTemplate[]> {
  try {
    const rows = await db.sectionTemplate.findMany({ orderBy: { createdAt: "desc" }, take: 60 });
    return rows.flatMap((row) => {
      const stored = (row.doc ?? {}) as { builder?: unknown; style?: unknown };
      const doc: BuilderDoc | undefined = parseBuilder(stored.builder);
      if (!doc) return [];
      return [
        {
          id: row.id,
          name: row.name,
          description: row.description || "Your saved design",
          doc,
          style: parseStyle(stored.style),
          saved: true as const,
        },
      ];
    });
  } catch {
    return [];
  }
}
