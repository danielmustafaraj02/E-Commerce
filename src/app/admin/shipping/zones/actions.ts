"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";

const zoneSchema = z.object({
  name: z.string().min(1).max(200),
  countries: z.string().min(1),
  methodIds: z.array(z.string()),
});

function parseForm(formData: FormData) {
  return zoneSchema.safeParse({
    name: formData.get("name"),
    countries: formData.get("countries"),
    methodIds: formData.getAll("methodIds"),
  });
}

function parseCountries(raw: string) {
  return Array.from(
    new Set(
      raw
        .split(/[\s,]+/)
        .map((code) => code.trim().toUpperCase())
        .filter(Boolean)
    )
  );
}

export async function createShippingZone(_prevState: unknown, formData: FormData) {
  const session = await requireStaff();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const countries = parseCountries(parsed.data.countries);
  if (countries.some((code) => !/^[A-Z]{2}$/.test(code))) {
    return { error: "Countries must be ISO 3166-1 alpha-2 codes, e.g. IT, US, DE" };
  }

  const zone = await db.shippingZone.create({
    data: {
      name: parsed.data.name,
      countries: { create: countries.map((country) => ({ country })) },
      methods: { create: parsed.data.methodIds.map((methodId) => ({ methodId })) },
    },
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "shippingZone.create",
    entityType: "ShippingZone",
    entityId: zone.id,
    after: { name: zone.name, countries, methodIds: parsed.data.methodIds },
  });

  redirect("/admin/shipping/zones");
}

export async function updateShippingZone(zoneId: string, _prevState: unknown, formData: FormData) {
  const session = await requireStaff();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const countries = parseCountries(parsed.data.countries);
  if (countries.some((code) => !/^[A-Z]{2}$/.test(code))) {
    return { error: "Countries must be ISO 3166-1 alpha-2 codes, e.g. IT, US, DE" };
  }

  const before = await db.shippingZone.findUnique({
    where: { id: zoneId },
    include: { countries: true, methods: true },
  });
  if (!before) return { error: "Shipping zone not found" };

  await db.$transaction([
    db.shippingZone.update({ where: { id: zoneId }, data: { name: parsed.data.name } }),
    db.shippingZoneCountry.deleteMany({ where: { zoneId } }),
    db.shippingZoneCountry.createMany({ data: countries.map((country) => ({ zoneId, country })) }),
    db.shippingZoneMethod.deleteMany({ where: { zoneId } }),
    db.shippingZoneMethod.createMany({
      data: parsed.data.methodIds.map((methodId) => ({ zoneId, methodId })),
    }),
  ]);

  await writeAuditLog({
    userId: session!.user.id,
    action: "shippingZone.update",
    entityType: "ShippingZone",
    entityId: zoneId,
    before: {
      name: before.name,
      countries: before.countries.map((c) => c.country),
      methodIds: before.methods.map((m) => m.methodId),
    },
    after: { name: parsed.data.name, countries, methodIds: parsed.data.methodIds },
  });

  redirect("/admin/shipping/zones");
}

export async function deleteShippingZone(zoneId: string) {
  const session = await requireStaff();
  const before = await db.shippingZone.findUnique({ where: { id: zoneId } });
  if (!before) redirect("/admin/shipping/zones");

  await db.shippingZone.delete({ where: { id: zoneId } });

  await writeAuditLog({
    userId: session!.user.id,
    action: "shippingZone.delete",
    entityType: "ShippingZone",
    entityId: zoneId,
    before,
  });

  redirect("/admin/shipping/zones");
}
