"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";
import { parseBlockTheme } from "@/lib/block-theme";
import { BLOCK_THEME_KEY } from "@/lib/block-theme-store";

export type BlockStyleState = { ok?: string; error?: string };

function refresh() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings/block-styles");
}

/** Saves the whole theme. The input is re-validated control by control, so
 *  nothing but clamped numbers, hex colours and listed choices is stored. */
export async function saveBlockStyles(json: string): Promise<BlockStyleState> {
  const session = await requireAdmin();
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { error: "Could not read the styles. Reload the page and try again." };
  }
  const theme = parseBlockTheme(raw);
  const layout = theme as unknown as Prisma.InputJsonValue;
  try {
    await db.pageLayout.upsert({
      where: { target: BLOCK_THEME_KEY },
      create: { target: BLOCK_THEME_KEY, layout },
      update: { layout },
    });
  } catch {
    return { error: "Could not save. Check the database connection and try again." };
  }
  await writeAuditLog({
    userId: session.user!.id!,
    action: "settings.block_styles.update",
    entityType: "PageLayout",
    entityId: BLOCK_THEME_KEY,
  });
  refresh();
  return { ok: "Block styles saved." };
}

export async function resetBlockStyles(): Promise<BlockStyleState> {
  const session = await requireAdmin();
  await db.pageLayout.deleteMany({ where: { target: BLOCK_THEME_KEY } }).catch(() => undefined);
  await writeAuditLog({
    userId: session.user!.id!,
    action: "settings.block_styles.reset",
    entityType: "PageLayout",
    entityId: BLOCK_THEME_KEY,
  });
  refresh();
  return { ok: "Every block is back to its default look." };
}
