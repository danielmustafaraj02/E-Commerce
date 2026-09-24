import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ findMany: vi.fn(), findFirst: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: { look: { findMany: mocks.findMany, findFirst: mocks.findFirst } },
}));

import { getAllLooks, getLookById, getLooksForProducts } from "./look-data";

const piece = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  slug: `slug-${id}`,
  name: `Pezzo ${id}`,
  nameEn: `Piece ${id}`,
  price: 1000,
  currency: "EUR",
  stockQty: 3,
  trackInventory: true,
  images: [{ url: `https://img/${id}.jpg` }],
  ...overrides,
});

beforeEach(() => {
  mocks.findMany.mockReset();
  mocks.findFirst.mockReset();
});

describe("getLooksForProducts", () => {
  it("returns complete looks with localized, priced pieces", async () => {
    mocks.findMany.mockResolvedValue([
      {
        id: "look1",
        name: "Laguna",
        imageUrl: null,
        discountPercent: 15,
        products: [
          piece("n"),
          piece("b", { stockQty: 0 }),
          piece("e", { trackInventory: false, stockQty: 0 }),
        ],
      },
    ]);

    const [look] = await getLooksForProducts(["n"], "en");

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { active: true, products: { some: { id: { in: ["n"] } } } },
      })
    );
    expect(look.pricing).toEqual({ individualTotal: 3000, setTotal: 2550, saving: 450 });
    expect(look.pieces.map((p) => [p.name, p.available])).toEqual([
      ["Piece n", true],
      ["Piece b", false],
      // Dropshipped: the supplier's stock isn't ours to track.
      ["Piece e", true],
    ]);
    expect(look.available).toBe(false);
  });

  it("leaves out looks without the full set of active pieces", async () => {
    mocks.findMany.mockResolvedValue([
      {
        id: "look1",
        name: "L",
        imageUrl: null,
        discountPercent: 15,
        products: [piece("n"), piece("b")],
      },
    ]);

    expect(await getLooksForProducts(["n"], "en")).toEqual([]);
  });

  it("doesn't query for an empty list", async () => {
    expect(await getLooksForProducts([], "en")).toEqual([]);
    expect(mocks.findMany).not.toHaveBeenCalled();
  });
});

const lookRow = (id: string, pieces: string[]) => ({
  id,
  name: `Look ${id}`,
  imageUrl: null,
  discountPercent: 15,
  products: pieces.map((p) => piece(p)),
});

describe("getAllLooks", () => {
  it("lists only complete, active looks, newest first, up to the limit", async () => {
    mocks.findMany.mockResolvedValue([
      lookRow("a", ["a1", "a2", "a3"]),
      lookRow("b", ["b1", "b2"]),
      lookRow("c", ["c1", "c2", "c3"]),
      lookRow("d", ["d1", "d2", "d3"]),
    ]);

    const looks = await getAllLooks("en", 2);

    expect(looks.map((l) => l.id)).toEqual(["a", "c"]);
    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { active: true }, orderBy: { createdAt: "desc" } })
    );
  });
});

describe("getLookById", () => {
  it("returns the look when it is active and complete", async () => {
    mocks.findFirst.mockResolvedValue(lookRow("a", ["a1", "a2", "a3"]));
    const look = await getLookById("a", "en");
    expect(look?.pricing.setTotal).toBe(2550);
    expect(mocks.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "a", active: true } })
    );
  });

  it("returns null for a missing or incomplete look", async () => {
    mocks.findFirst.mockResolvedValue(null);
    expect(await getLookById("x", "en")).toBeNull();
    mocks.findFirst.mockResolvedValue(lookRow("b", ["b1", "b2"]));
    expect(await getLookById("b", "en")).toBeNull();
  });
});
