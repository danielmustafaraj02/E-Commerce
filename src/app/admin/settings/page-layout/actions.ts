"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";
import { HOME_SECTIONS, PRODUCT_SECTIONS, resolveLayout } from "@/lib/page-layout";

export type PageLayoutState = { ok?: string; error?: string };

const schema = z.object({
  target: z.enum(["home", "product"]),
  // JSON array of { id, visible }; normalised below, so unknown ids are dropped.
  layout: z.string().max(4000),
});

export async function savePageLayout(
  _prev: PageLayoutState,
  formData: FormData
): Promise<PageLayoutState> {
  const session = await requireAdmin();

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid layout." };

  let raw: unknown;
  try {
    raw = JSON.parse(parsed.data.layout);
  } catch {
    return { error: "Invalid layout." };
  }

  const isHome = parsed.data.target === "home";
  const layout = resolveLayout(raw, isHome ? HOME_SECTIONS : PRODUCT_SECTIONS);
  const data = isHome ? { homeLayout: layout } : { productPageLayout: layout };

  const existing = await db.storeSettings.findFirst({ select: { id: true } });
  if (existing) {
    await db.storeSettings.update({ where: { id: existing.id }, data });
  } else {
    await db.storeSettings.create({ data });
  }

  await writeAuditLog({
    userId: session.user!.id!,
    action: `settings.page_layout.${parsed.data.target}`,
    entityType: "StoreSettings",
    entityId: existing?.id,
    after: data,
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings/page-layout");
  return { ok: isHome ? "Home page layout saved." : "Product page layout saved." };
}

/** Back to the built-in order (stores NULL, so future sections appear too). */
export async function resetPageLayout(target: "home" | "product"): Promise<PageLayoutState> {
  const session = await requireAdmin();
  const data =
    target === "home"
      ? { homeLayout: Prisma.DbNull }
      : { productPageLayout: Prisma.DbNull };

  const existing = await db.storeSettings.findFirst({ select: { id: true } });
  if (existing) await db.storeSettings.update({ where: { id: existing.id }, data });

  await writeAuditLog({
    userId: session.user!.id!,
    action: `settings.page_layout.${target}.reset`,
    entityType: "StoreSettings",
    entityId: existing?.id,
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings/page-layout");
  return { ok: "Restored the default layout." };
}
