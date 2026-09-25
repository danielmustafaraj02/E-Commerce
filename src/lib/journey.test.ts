import { describe, expect, it } from "vitest";
import {
  addToJourney,
  isReturningVisit,
  parseJourney,
  pickRelated,
  relatedScore,
  JOURNEY_MAX,
  WELCOME_BACK_AFTER_MS,
  type JourneyEntry,
} from "./journey";

const entry = (id: string, viewedAt: number): JourneyEntry => ({
  id,
  slug: id,
  url: `/products/${id}`,
  name: id,
  image: null,
  price: 7900,
  currency: "EUR",
  viewedAt,
});

describe("journey storage", () => {
  it("reads entries newest first, dropping malformed and duplicate ones", () => {
    const raw = JSON.stringify([
      entry("a", 1),
      entry("b", 3),
      { id: "bad" },
      { ...entry("x", 9), url: "https://evil.example/" },
      entry("a", 2),
    ]);
    expect(parseJourney(raw).map((e) => [e.id, e.viewedAt])).toEqual([
      ["b", 3],
      ["a", 2],
    ]);
    expect(parseJourney("not json")).toEqual([]);
    expect(parseJourney(null)).toEqual([]);
  });

  it("moves a piece seen again to the front and keeps only the latest four", () => {
    let entries: JourneyEntry[] = [];
    for (const [i, id] of ["a", "b", "c", "d", "e"].entries()) entries = addToJourney(entries, entry(id, i));
    expect(entries.map((e) => e.id)).toEqual(["e", "d", "c", "b"]);
    entries = addToJourney(entries, entry("c", 10));
    expect(entries.map((e) => e.id)).toEqual(["c", "e", "d", "b"]);
    expect(entries).toHaveLength(JOURNEY_MAX);
  });

  it("greets a visit after a long pause", () => {
    const now = 10 * WELCOME_BACK_AFTER_MS;
    expect(isReturningVisit([entry("a", now - WELCOME_BACK_AFTER_MS)], now)).toBe(true);
    expect(isReturningVisit([entry("a", now - 1000)], now)).toBe(false);
    expect(isReturningVisit([], now)).toBe(false);
  });
});

describe("pieces to go with the journey", () => {
  const piece = (id: string, color: string | null, kind: string | null, lookId: string | null = null, day = 1) => ({
    id,
    color,
    kind,
    lookId,
    createdAt: new Date(2026, 0, day),
  });
  const viewed = [piece("v1", "turquoise", "necklace", "look1")];

  it("prefers the rest of the look, then another kind in the same colour", () => {
    expect(relatedScore(piece("c1", "red", "earrings", "look1"), viewed)).toBeGreaterThan(
      relatedScore(piece("c2", "turquoise", "earrings"), viewed)
    );
    expect(relatedScore(piece("c2", "turquoise", "earrings"), viewed)).toBeGreaterThan(
      relatedScore(piece("c3", "turquoise", "necklace"), viewed)
    );
    expect(relatedScore(piece("c4", "red", "bracelet"), viewed)).toBe(0);
  });

  it("never suggests a viewed piece or an unrelated one", () => {
    const picked = pickRelated(
      [piece("v1", "turquoise", "necklace", "look1"), piece("c2", "turquoise", "earrings"), piece("c4", "red", "bracelet")],
      viewed,
      4
    );
    expect(picked.map((p) => p.id)).toEqual(["c2"]);
  });
});
