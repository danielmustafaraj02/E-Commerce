import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  findUnique: vi.fn(),
  requireStaff: vi.fn(),
  writeAuditLog: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mocks.redirect(url);
    throw new Error("NEXT_REDIRECT");
  },
}));
vi.mock("@/lib/db", () => ({
  db: {
    product: {
      create: mocks.create,
      update: mocks.update,
      findUnique: mocks.findUnique,
    },
  },
}));
vi.mock("@/lib/require-admin", () => ({
  requireStaff: mocks.requireStaff,
  requireAdmin: vi.fn(),
}));
vi.mock("@/lib/audit-log", () => ({ writeAuditLog: mocks.writeAuditLog }));

import { createProduct, updateProduct } from "./actions";

function form(fields: Record<string, string>) {
  const data = new FormData();
  data.set("name", "Collana Fiore");
  data.set("slug", "collana-fiore");
  data.set("description", "Una collana artigianale.");
  data.set("price", "89");
  data.set("sku", "SKU-1");
  data.set("stockQty", "5");
  data.set("lowStockThreshold", "2");
  data.set("active", "on");
  data.set("trackInventory", "on");
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.requireStaff.mockResolvedValue({ user: { id: "staff1" } });
  mocks.create.mockResolvedValue({ id: "p1" });
  mocks.findUnique.mockResolvedValue({ id: "p1", name: "Collana Fiore" });
  mocks.update.mockResolvedValue({ id: "p1" });
});

describe("createProduct compareAtPrice", () => {
  it("stores an admin-entered compare-at price in cents", async () => {
    await expect(createProduct(null, form({ compareAtPrice: "69" }))).rejects.toThrow(
      "NEXT_REDIRECT"
    );

    expect(mocks.create.mock.calls[0][0].data.compareAtPrice).toBe(6900);
  });

  it("leaves compareAtPrice unset when left blank", async () => {
    await expect(createProduct(null, form({}))).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.create.mock.calls[0][0].data.compareAtPrice).toBeUndefined();
  });
});

describe("updateProduct compareAtPrice", () => {
  it("stores an admin-entered compare-at price in cents", async () => {
    await expect(updateProduct("p1", null, form({ compareAtPrice: "69" }))).rejects.toThrow(
      "NEXT_REDIRECT"
    );

    expect(mocks.update.mock.calls[0][0].data.compareAtPrice).toBe(6900);
  });

  it("clears compareAtPrice (sets null, not undefined) when the field is left blank", async () => {
    await expect(updateProduct("p1", null, form({}))).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.update.mock.calls[0][0].data.compareAtPrice).toBeNull();
  });
});
