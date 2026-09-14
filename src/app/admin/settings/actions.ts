"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";

const settingsSchema = z.object({
  storeName: z.string().min(1).max(200),
  logoUrl: z.string().url().optional().or(z.literal("")),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #111827"),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #4F46E5"),
  fontFamily: z.string().min(1).max(100),
  defaultCurrency: z.string().length(3),
  defaultLocale: z.string().min(2).max(20),
  contactEmail: z.string().email(),
  vatNumber: z.string().max(50).optional().or(z.literal("")),
  companyLegalName: z.string().max(200).optional().or(z.literal("")),
  companyAddress: z.string().max(500).optional().or(z.literal("")),
  pricesIncludeTax: z.coerce.boolean(),
  freeShippingThreshold: z.coerce.number().nonnegative().optional(),
  trustBadgeText: z.string().max(200).optional().or(z.literal("")),
  showTestimonials: z.coerce.boolean(),
  siteUrl: z.string().url().optional().or(z.literal("")),
  metaDescription: z.string().max(300).optional().or(z.literal("")),
  ogImageUrl: z.string().url().optional().or(z.literal("")),
  googleSiteVerification: z.string().max(200).optional().or(z.literal("")),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  twitterUrl: z.string().url().optional().or(z.literal("")),
  tiktokUrl: z.string().url().optional().or(z.literal("")),
  youtubeUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
});

export async function updateStoreSettings(_prevState: unknown, formData: FormData) {
  const session = await requireAdmin();

  const parsed = settingsSchema.safeParse({
    storeName: formData.get("storeName"),
    logoUrl: formData.get("logoUrl") || "",
    primaryColor: formData.get("primaryColor"),
    secondaryColor: formData.get("secondaryColor"),
    fontFamily: formData.get("fontFamily"),
    defaultCurrency: formData.get("defaultCurrency"),
    defaultLocale: formData.get("defaultLocale"),
    contactEmail: formData.get("contactEmail"),
    vatNumber: formData.get("vatNumber") || "",
    companyLegalName: formData.get("companyLegalName") || "",
    companyAddress: formData.get("companyAddress") || "",
    pricesIncludeTax: formData.get("pricesIncludeTax") === "on",
    freeShippingThreshold: formData.get("freeShippingThreshold") || undefined,
    trustBadgeText: formData.get("trustBadgeText") || "",
    showTestimonials: formData.get("showTestimonials") === "on",
    siteUrl: formData.get("siteUrl") || "",
    metaDescription: formData.get("metaDescription") || "",
    ogImageUrl: formData.get("ogImageUrl") || "",
    googleSiteVerification: formData.get("googleSiteVerification") || "",
    facebookUrl: formData.get("facebookUrl") || "",
    instagramUrl: formData.get("instagramUrl") || "",
    twitterUrl: formData.get("twitterUrl") || "",
    tiktokUrl: formData.get("tiktokUrl") || "",
    youtubeUrl: formData.get("youtubeUrl") || "",
    linkedinUrl: formData.get("linkedinUrl") || "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input", success: false };
  }
  const data = parsed.data;

  const before = await db.storeSettings.findFirst();

  const normalized = {
    ...data,
    logoUrl: data.logoUrl || null,
    vatNumber: data.vatNumber || null,
    companyLegalName: data.companyLegalName || null,
    companyAddress: data.companyAddress || null,
    trustBadgeText: data.trustBadgeText || null,
    freeShippingThreshold:
      data.freeShippingThreshold !== undefined
        ? Math.round(data.freeShippingThreshold * 100)
        : null,
    siteUrl: data.siteUrl ? data.siteUrl.replace(/\/+$/, "") : null,
    metaDescription: data.metaDescription || null,
    ogImageUrl: data.ogImageUrl || null,
    googleSiteVerification: data.googleSiteVerification || null,
    facebookUrl: data.facebookUrl || null,
    instagramUrl: data.instagramUrl || null,
    twitterUrl: data.twitterUrl || null,
    tiktokUrl: data.tiktokUrl || null,
    youtubeUrl: data.youtubeUrl || null,
    linkedinUrl: data.linkedinUrl || null,
  };

  const updated = await db.storeSettings.upsert({
    where: { id: before?.id ?? "default" },
    update: normalized,
    create: { id: before?.id ?? "default", ...normalized },
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "settings.update",
    entityType: "StoreSettings",
    entityId: updated.id,
    before,
    after: updated,
  });

  return { error: null, success: true };
}
