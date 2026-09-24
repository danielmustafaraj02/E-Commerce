import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  lookCreate: vi.fn(),
  lookUpdate: vi.fn(),
  lookFindUnique: vi.fn(),
  lookDelete: vi.fn(),
  productCount: vi.fn(),
  productUpdateMany: vi.fn(),
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
vi.mock("@/lib/db", () => {
  const tx = {
    look: { create: mocks.lookCreate, update: mocks.lookUpdate },
    product: { updateMany: mocks.productUpdateMany },
  };
  return {
    db: {
      look: { findUnique: mocks.lookFindUnique, delete: mocks.lookDelete },
      product: { count: mocks.productCount },
      $transaction: (fn: (t: typeof tx) => unknown) => fn(tx),
    },
  };
});
vi.mock("@/lib/require-admin", () => ({ requireStaff: mocks.requireStaff }));
vi.mock("@/lib/audit-log", () => ({ writeAuditLog: mocks.writeAuditLog }));

import { createLook, deleteLook, updateLook } from "./actions";

function form(fields: Record<string, string | string[]>) {
  const data = new FormData();
  data.set("name", "Laguna");
  data.set("discountPercent", "15");
  data.set("active", "on");
  for (const id of ["n", "b", "e"]) data.append("productIds", id);
  for (const [key, value] of Object.entries(fields)) {
    data.delete(key);
    for (const v of Array.isArray(value) ? value : [value]) data.append(key, v);
  }
  return data;
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.requireStaff.mockResolvedValue({ user: { id: "staff1" } });
  mocks.productCount.mockResolvedValue(3);
  mocks.lookCreate.mockResolvedValue({ id: "look1" });
  mocks.lookUpdate.mockResolvedValue({ id: "look1" });
  mocks.lookFindUnique.mockResolvedValue({ id: "look1", name: "Laguna" });
});

describe("createLook", () => {
  it("creates the look and assigns its three pieces", async () => {
    await expect(createLook(null, form({}))).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.requireStaff).toHaveBeenCalled();
    expect(mocks.lookCreate).toHaveBeenCalledWith({
      data: { name: "Laguna", imageUrl: null, discountPercent: 15, active: true },
    });
    expect(mocks.productUpdateMany).toHaveBeenCalledWith({
      where: { id: { in: ["n", "b", "e"] } },
      data: { lookId: "look1" },
    });
    expect(mocks.redirect).toHaveBeenCalledWith("/admin/looks");
  });

  it("needs exactly three different pieces", async () => {
    expect(await createLook(null, form({ productIds: ["n", "b"] }))).toEqual({
      error: expect.stringMatching(/three different pieces/),
    });
    expect(await createLook(null, form({ productIds: ["n", "n", "e"] }))).toEqual({
      error: expect.stringMatching(/three different pieces/),
    });
    expect(mocks.lookCreate).not.toHaveBeenCalled();
  });

  it("refuses pieces that don't exist", async () => {
    mocks.productCount.mockResolvedValue(2);

    expect(await createLook(null, form({}))).toEqual({ error: expect.any(String) });
    expect(mocks.lookCreate).not.toHaveBeenCalled();
  });

  it("keeps the discount between 1% and 50%", async () => {
    expect(await createLook(null, form({ discountPercent: "80" }))).toEqual({
      error: expect.any(String),
    });
  });
});

describe("updateLook", () => {
  it("releases pieces that were removed and assigns the new ones", async () => {
    await expect(updateLook("look1", null, form({ productIds: ["n", "b", "x"] }))).rejects.toThrow(
      "NEXT_REDIRECT"
    );

    expect(mocks.productUpdateMany).toHaveBeenNthCalledWith(1, {
      where: { lookId: "look1", id: { notIn: ["n", "b", "x"] } },
      data: { lookId: null },
    });
    expect(mocks.productUpdateMany).toHaveBeenNthCalledWith(2, {
      where: { id: { in: ["n", "b", "x"] } },
      data: { lookId: "look1" },
    });
  });
});

describe("deleteLook", () => {
  it("deletes the look (its pieces are released by the relation)", async () => {
    await expect(deleteLook("look1")).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.requireStaff).toHaveBeenCalled();
    expect(mocks.lookDelete).toHaveBeenCalledWith({ where: { id: "look1" } });
  });
});
