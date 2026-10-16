import { CONCEPTS, parseHeroConcepts, type ConceptId, type HeroConceptsConfig } from "./config";

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
