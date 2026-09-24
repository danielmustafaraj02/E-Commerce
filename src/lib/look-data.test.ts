import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ findMany: vi.fn() }));
vi.mock("@/lib/db", () => ({ db: { look: { findMany: mocks.findMany } } }));

import { getLooksForProducts } from "./look-data";

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

beforeEach(() => mocks.findMany.mockReset());

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
