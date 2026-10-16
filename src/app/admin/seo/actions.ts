"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";
import { locales } from "@/lib/i18n/locale-constants";

export type MetaState = { ok?: string; error?: string } | undefined;

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

/** Saves the search title/description/share image for one page key, in every
 *  language at once. A language with nothing filled in loses its override. */
export async function savePageMeta(
  key: string,
  _prev: MetaState,
  formData: FormData
): Promise<MetaState> {
  const session = await requireStaff();
  if (!key || key.length > 300) return { error: "Unknown page." };

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("meta") ?? "{}"));
  } catch {
    return { error: "The form could not be read. Reload and try again." };
  }
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<string, Record<string, unknown>>;

  const saved: Record<string, unknown> = {};
  try {
    for (const locale of locales) {
      const row = input[locale] ?? {};
      const title = clean(row.title, 120);
      const description = clean(row.description, 320);
      const ogImageUrl = clean(row.ogImageUrl, 2000);
      const noindex = row.noindex === true;
      if (ogImageUrl && !/^(\/(?!\/)|https:\/\/)/.test(ogImageUrl)) {
        return { error: "The share image must be a /path or an https:// URL." };
      }
      if (!title && !description && !ogImageUrl && !noindex) {
        await db.pageMeta.deleteMany({ where: { key, locale } });
        continue;
      }
      const data = {
        title: title || null,
        description: description || null,
        ogImageUrl: ogImageUrl || null,
        noindex,
      };
      await db.pageMeta.upsert({
        where: { key_locale: { key, locale } },
        create: { key, locale, ...data },
        update: data,
      });
      saved[locale] = data;
    }
  } catch (error) {
    console.error("Page metadata not saved", error);
    return { error: "Could not save. The database may need its latest migration." };
  }

  await writeAuditLog({
    userId: session!.user.id,
    action: "seo.pageMeta.update",
    entityType: "PageMeta",
    entityId: key,
    after: saved,
  });
  // Every storefront page (they are cached; settings show on all of them).
  revalidatePath("/[locale]", "layout");
  return { ok: "Saved." };
}
