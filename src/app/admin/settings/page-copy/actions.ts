"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";
import { parseHomeCopy } from "@/lib/home-copy";
import { locales, type Locale } from "@/lib/i18n/locale-constants";

export type PageCopyState = { ok?: string; error?: string };

/** Saves ONE language's overrides, leaving the other languages untouched.
 *  Fields left empty fall back to the built-in text. */
export async function savePageCopy(
  _prev: PageCopyState,
  formData: FormData
): Promise<PageCopyState> {
  const session = await requireAdmin();

  const locale = String(formData.get("locale") ?? "") as Locale;
  if (!locales.includes(locale)) return { error: "Unknown language." };

  let incoming: unknown;
  try {
    incoming = JSON.parse(String(formData.get("copy") ?? "{}"));
  } catch {
    return { error: "Invalid text." };
  }

  const existing = await db.storeSettings.findFirst({ select: { id: true, homeCopy: true } });
  const all = parseHomeCopy(existing?.homeCopy);
  const mine = parseHomeCopy({ [locale]: incoming })[locale];
  if (mine) all[locale] = mine;
  else delete all[locale];

  const homeCopy = Object.keys(all).length > 0 ? all : Prisma.DbNull;
  if (existing) {
    await db.storeSettings.update({ where: { id: existing.id }, data: { homeCopy } });
  } else {
    await db.storeSettings.create({ data: { homeCopy } });
  }

  await writeAuditLog({
    userId: session.user!.id!,
    action: "settings.page_copy.update",
    entityType: "StoreSettings",
    entityId: existing?.id,
    after: { locale, copy: mine ?? null },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings/page-copy");
  return { ok: "Text saved." };
}
