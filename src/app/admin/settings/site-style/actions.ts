"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";
import { COLOR_ROLES } from "@/lib/site-style";

/* A hex colour, or "" meaning "use the theme default". Nothing else is ever
   written: the value ends up inside a style attribute, so anything that is not
   a colour has no business being stored. */
const color = z
  .string()
  .trim()
  .regex(/^(#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}))?$/, "Use a hex colour like #154230")
  .optional();

/* A family NAME, not a CSS value: letters, digits, spaces and hyphens only, so
   a stored value cannot close the declaration and inject rules of its own. */
const family = z
  .string()
  .trim()
  .max(64)
  .regex(/^[\w \-]*$/, "Letters, numbers, spaces and hyphens only")
  .optional();

const schema = z.object({
  colorBackground: color,
  colorSurface: color,
  colorText: color,
  colorTextMuted: color,
  colorPrimary: color,
  colorOnPrimary: color,
  colorAccent: color,
  colorBorder: color,
  fontHeading: family,
  fontBody: family,
});

export type SiteStyleState = { ok?: string; error?: string };

/** Empty string in the form means "no override" — stored as NULL, so the role
 *  keeps following the theme instead of freezing today's value into the row. */
const orNull = (value: string | undefined) => (value && value.length > 0 ? value : null);

/* Every storefront route reads the settings row through the cached
   getStoreSettings(), so a style change has to drop the whole rendered site,
   not one page. layout is the root of all of them. */
function revalidateSite() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings/site-style");
}

export async function saveSiteStyle(
  _prev: SiteStyleState,
  formData: FormData
): Promise<SiteStyleState> {
  const session = await requireAdmin();

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the values and try again." };
  }

  const data = {
    ...Object.fromEntries(COLOR_ROLES.map((role) => [role, orNull(parsed.data[role])])),
    fontHeading: orNull(parsed.data.fontHeading),
    fontBody: orNull(parsed.data.fontBody),
  };

  const existing = await db.storeSettings.findFirst({ select: { id: true } });
  if (existing) {
    await db.storeSettings.update({ where: { id: existing.id }, data });
  } else {
    await db.storeSettings.create({ data });
  }

  await writeAuditLog({
    userId: session.user!.id!,
    action: "settings.site_style.update",
    entityType: "StoreSettings",
    entityId: existing?.id,
    after: data,
  });

  revalidateSite();
  return { ok: "Site style saved." };
}

/** Restore every role to the theme default by clearing the overrides. */
export async function resetSiteStyle(): Promise<SiteStyleState> {
  const session = await requireAdmin();

  const data = {
    ...Object.fromEntries(COLOR_ROLES.map((role) => [role, null])),
    fontHeading: null,
    fontBody: null,
  };

  const existing = await db.storeSettings.findFirst({ select: { id: true } });
  if (existing) await db.storeSettings.update({ where: { id: existing.id }, data });

  await writeAuditLog({
    userId: session.user!.id!,
    action: "settings.site_style.reset",
    entityType: "StoreSettings",
    entityId: existing?.id,
  });

  revalidateSite();
  return { ok: "Restored the theme defaults." };
}
