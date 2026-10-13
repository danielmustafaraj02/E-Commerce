import { cache } from "react";
import { db } from "@/lib/db";
import { CONCEPTS, parseHeroConcepts, type ConceptId, type HeroConceptsConfig } from "./config";

/** Where the published hero concept lives (a PageLayout row, like the draft). */
export const HERO_CONCEPTS_LIVE_KEY = "hero-concepts:live";

export type LiveHeroConcept = { concept: ConceptId; config: HeroConceptsConfig; at: string };

/** Parses a stored live record; null when it is missing or unusable. */
export function parseLiveHero(value: unknown): LiveHeroConcept | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (!CONCEPTS.includes(raw.concept as ConceptId)) return null;
  return {
    concept: raw.concept as ConceptId,
    config: parseHeroConcepts(raw.config),
    at: typeof raw.at === "string" ? raw.at : "",
  };
}

/**
 * The hero concept published from Admin > Settings > Hero concepts, or null
 * for the original hero. Any failure (missing table, bad data) falls back to
 * the original hero rather than breaking the home page.
 */
export const getLiveHeroConcept = cache(async (): Promise<LiveHeroConcept | null> => {
  try {
    const row = await db.pageLayout.findUnique({
      where: { target: HERO_CONCEPTS_LIVE_KEY },
      select: { layout: true },
    });
    return parseLiveHero(row?.layout);
  } catch {
    return null;
  }
});
