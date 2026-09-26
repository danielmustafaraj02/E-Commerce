// "Your Murano Journey": the pieces this browser has recently looked at,
// kept in localStorage (no account, nothing personal: a product snapshot and
// when it was seen). Pure helpers here; the React side is
// lib/use-recently-viewed.ts and components/murano-journey.tsx.

export const JOURNEY_KEY = "perla-murano-journey";
// Set once per tab session: whether this visit comes after a long pause.
export const JOURNEY_RETURN_KEY = "perla-murano-journey-return";
export const JOURNEY_MAX = 4;
// A visit this long after the last viewed piece is greeted with "Welcome back".
export const WELCOME_BACK_AFTER_MS = 3 * 24 * 60 * 60 * 1000;

export type JourneyEntry = {
  id: string;
  slug: string;
  url: string;
  name: string;
  image: string | null;
  price: number; // cents
  currency: string;
  viewedAt: number; // ms since epoch
  variant?: string;
};

function isEntry(value: unknown): value is JourneyEntry {
  if (!value || typeof value !== "object") return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    typeof e.slug === "string" &&
    typeof e.url === "string" &&
    e.url.startsWith("/products/") &&
    typeof e.name === "string" &&
    (e.image === null || typeof e.image === "string") &&
    typeof e.price === "number" &&
    typeof e.currency === "string" &&
    typeof e.viewedAt === "number"
  );
}

// Reads what's stored, dropping anything malformed or duplicated, newest
// first, at most JOURNEY_MAX.
export function parseJourney(raw: string | null): JourneyEntry[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const seen = new Set<string>();
  return data
    .filter(isEntry)
    .sort((a, b) => b.viewedAt - a.viewedAt)
    .filter((entry) => !seen.has(entry.id) && seen.add(entry.id))
    .slice(0, JOURNEY_MAX);
}

// A piece seen again moves to the front instead of appearing twice.
export function addToJourney(entries: JourneyEntry[], entry: JourneyEntry): JourneyEntry[] {
  return [entry, ...entries.filter((e) => e.id !== entry.id)].slice(0, JOURNEY_MAX);
}

// Whether the newest piece was seen long enough ago to say "Welcome back".
export function isReturningVisit(entries: JourneyEntry[], now: number): boolean {
  const last = Math.max(0, ...entries.map((e) => e.viewedAt));
  return last > 0 && now - last >= WELCOME_BACK_AFTER_MS;
}

// -- Pieces to go with the journey ---------------------------------------------

export type RelatableProduct = {
  id: string;
  color: string | null;
  lookId: string | null;
  kind: string | null; // lib/gift-finder.ts deriveProductType
  createdAt: Date;
};

// Scores a candidate against the viewed pieces, favouring (in order) the rest
// of a styled look, another kind of piece in the same colour, the same colour,
// and a kind the visitor hasn't looked at yet. Zero means "unrelated".
export function relatedScore(candidate: RelatableProduct, viewed: RelatableProduct[]): number {
  let score = 0;
  for (const piece of viewed) {
    if (candidate.lookId && candidate.lookId === piece.lookId) score += 6;
    if (candidate.color && candidate.color === piece.color) {
      score += candidate.kind && candidate.kind !== piece.kind ? 4 : 2;
    }
  }
  if (score > 0 && candidate.kind && !viewed.some((piece) => piece.kind === candidate.kind)) {
    score += 1;
  }
  return score;
}

export function pickRelated<T extends RelatableProduct>(
  candidates: T[],
  viewed: RelatableProduct[],
  take: number
): T[] {
  const viewedIds = new Set(viewed.map((piece) => piece.id));
  return candidates
    .filter((candidate) => !viewedIds.has(candidate.id))
    .map((candidate) => ({ candidate, score: relatedScore(candidate, viewed) }))
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || b.candidate.createdAt.getTime() - a.candidate.createdAt.getTime()
    )
    .slice(0, take)
    .map(({ candidate }) => candidate);
}
