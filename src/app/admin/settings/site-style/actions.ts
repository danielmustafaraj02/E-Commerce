"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";
import { COLOR_ROLES } from "@/lib/site-style";
import { parseCustomPalettes, type CustomPalette } from "@/lib/color-palettes";

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


/* ── The admin's own palettes ─────────────────────────────────────────────
   Saved on the settings row as JSON. Both actions re-read the stored list,
   change it and write the whole array back: the list is short, and reading
   before writing is what keeps two admins saving at once from each dropping
   the other's palette. */

const MAX_CUSTOM_PALETTES = 24;

/* Spelled out rather than generated from COLOR_ROLES: a schema built with
   Object.fromEntries infers as { name: string } and loses every colour field,
   so parsed.data would not type-check against the roles it actually holds. */
const paletteColor = z
  .string()
  .trim()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Every colour must be a hex value");

const paletteSchema = z.object({
  name: z.string().trim().min(1, "Give the palette a name").max(40),
  colorBackground: paletteColor,
  colorSurface: paletteColor,
  colorText: paletteColor,
  colorTextMuted: paletteColor,
  colorPrimary: paletteColor,
  colorOnPrimary: paletteColor,
  colorAccent: paletteColor,
  colorBorder: paletteColor,
});

async function readPalettes() {
  const row = await db.storeSettings.findFirst({
    select: { id: true, customPalettes: true },
  });
  return { id: row?.id ?? null, palettes: parseCustomPalettes(row?.customPalettes) };
}

/** Save the eight colours currently in the form under a name of the admin's. */
export async function saveCustomPalette(
  _prev: SiteStyleState,
  formData: FormData
): Promise<SiteStyleState> {
  const session = await requireAdmin();

  const parsed = paletteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the palette and try again." };
  }

  const { id, palettes } = await readPalettes();
  const name = parsed.data.name;

  if (palettes.length >= MAX_CUSTOM_PALETTES && !palettes.some((p) => p.name === name)) {
    return { error: `You can keep ${MAX_CUSTOM_PALETTES} palettes. Delete one first.` };
  }

  const entry: CustomPalette = {
    id: `custom-${Date.now().toString(36)}`,
    name,
    colors: Object.fromEntries(
      COLOR_ROLES.map((role) => [role, parsed.data[role].toLowerCase()])
    ) as CustomPalette["colors"],
  };

  /* Saving under a name that already exists REPLACES it, rather than leaving
     the admin with two entries they cannot tell apart in the dropdown. */
  const existingIndex = palettes.findIndex(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  );
  const next =
    existingIndex >= 0
      ? palettes.map((p, i) => (i === existingIndex ? { ...entry, id: p.id } : p))
      : [...palettes, entry];

  if (id) {
    await db.storeSettings.update({ where: { id }, data: { customPalettes: next } });
  } else {
    await db.storeSettings.create({ data: { customPalettes: next } });
  }

  await writeAuditLog({
    userId: session.user!.id!,
    action: "settings.site_style.palette_save",
    entityType: "StoreSettings",
    entityId: id ?? undefined,
    after: { name },
  });

  revalidateSite();
  return { ok: existingIndex >= 0 ? `Replaced "${name}".` : `Saved "${name}".` };
}

/** Remove one saved palette. The colours in use are left exactly as they are. */
export async function deleteCustomPalette(paletteId: string): Promise<SiteStyleState> {
  const session = await requireAdmin();

  const { id, palettes } = await readPalettes();
  if (!id) return { error: "Nothing to delete." };

  const target = palettes.find((p) => p.id === paletteId);
  if (!target) return { error: "That palette is no longer there." };

  await db.storeSettings.update({
    where: { id },
    data: { customPalettes: palettes.filter((p) => p.id !== paletteId) },
  });

  await writeAuditLog({
    userId: session.user!.id!,
    action: "settings.site_style.palette_delete",
    entityType: "StoreSettings",
    entityId: id,
    after: { name: target.name },
  });

  revalidateSite();
  return { ok: `Deleted "${target.name}".` };
}
