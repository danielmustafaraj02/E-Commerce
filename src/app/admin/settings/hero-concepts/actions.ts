"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";
import {
  CONCEPTS,
  HERO_CONCEPTS_DRAFT_KEY,
  parseHeroConcepts,
  type ConceptId,
} from "@/lib/hero-concepts/config";
import { HERO_CONCEPTS_LIVE_KEY, parseLiveHero } from "@/lib/hero-concepts/live";

export type HeroConceptsDraft = { at: string; config: unknown };
export type SaveState = { at?: string; error?: string };

/**
 * Keeps the three concepts' settings and the favourite as a draft. Only the
 * draft row is written: the live hero, the home page layout and every other
 * page stay exactly as they are.
 */
export async function saveHeroConceptsDraft(configJson: string): Promise<SaveState> {
  const session = await requireAdmin();
  if (typeof configJson !== "string" || configJson.length > 100_000)
    return { error: "These settings are too large to save." };
  let raw: unknown;
  try {
    raw = JSON.parse(configJson);
  } catch {
    return { error: "These settings could not be read." };
  }
  const draft: HeroConceptsDraft = { at: new Date().toISOString(), config: parseHeroConcepts(raw) };
  try {
    const json = draft as unknown as Prisma.InputJsonValue;
    await db.pageLayout.upsert({
      where: { target: HERO_CONCEPTS_DRAFT_KEY },
      create: { target: HERO_CONCEPTS_DRAFT_KEY, layout: json },
      update: { layout: json },
    });
    await writeAuditLog({
      userId: session.user!.id!,
      action: "hero_concepts.draft_saved",
      entityType: "PageLayout",
      entityId: HERO_CONCEPTS_DRAFT_KEY,
      after: draft,
    });
    return { at: draft.at };
  } catch (error) {
    console.error("Hero concepts draft not saved", error);
    return { error: "The draft could not be saved. Your changes are still here." };
  }
}

export type LiveState = { at?: string; concept?: ConceptId | null; error?: string };

/**
 * Makes one concept, with the given settings, the home page's hero. The
 * layout's own hero stays stored and returns with unpublishHeroConcept.
 */
export async function publishHeroConcept(concept: string, configJson: string): Promise<LiveState> {
  const session = await requireAdmin();
  if (!CONCEPTS.includes(concept as ConceptId)) return { error: "Unknown design." };
  if (typeof configJson !== "string" || configJson.length > 100_000)
    return { error: "These settings are too large to publish." };
  let raw: unknown;
  try {
    raw = JSON.parse(configJson);
  } catch {
    return { error: "These settings could not be read." };
  }
  const live = { concept, config: parseHeroConcepts(raw), at: new Date().toISOString() };
  try {
    const before = parseLiveHero(
      (await db.pageLayout.findUnique({ where: { target: HERO_CONCEPTS_LIVE_KEY } }))?.layout
    );
    const json = live as unknown as Prisma.InputJsonValue;
    await db.pageLayout.upsert({
      where: { target: HERO_CONCEPTS_LIVE_KEY },
      create: { target: HERO_CONCEPTS_LIVE_KEY, layout: json },
      update: { layout: json },
    });
    await writeAuditLog({
      userId: session.user!.id!,
      action: "hero_concepts.published",
      entityType: "PageLayout",
      entityId: HERO_CONCEPTS_LIVE_KEY,
      before,
      after: live,
    });
  } catch (error) {
    console.error("Hero concept not published", error);
    return { error: "The hero could not be published. Nothing changed on the home page." };
  }
  revalidatePath("/", "layout");
  return { at: live.at, concept: live.concept as ConceptId };
}

/** Brings back the home page's original hero (the one in Page layout). */
export async function unpublishHeroConcept(): Promise<LiveState> {
  const session = await requireAdmin();
  try {
    const row = await db.pageLayout.findUnique({ where: { target: HERO_CONCEPTS_LIVE_KEY } });
    await db.pageLayout.deleteMany({ where: { target: HERO_CONCEPTS_LIVE_KEY } });
    await writeAuditLog({
      userId: session.user!.id!,
      action: "hero_concepts.unpublished",
      entityType: "PageLayout",
      entityId: HERO_CONCEPTS_LIVE_KEY,
      before: parseLiveHero(row?.layout),
    });
  } catch (error) {
    console.error("Hero concept not unpublished", error);
    return { error: "The original hero could not be restored. Try again." };
  }
  revalidatePath("/", "layout");
  return { concept: null };
}
