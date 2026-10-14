import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
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
    category: {
      findFirst: mocks.findFirst,
      findUnique: mocks.findUnique,
      update: mocks.update,
    },
  },
}));
vi.mock("@/lib/require-admin", () => ({ requireStaff: mocks.requireStaff }));
vi.mock("@/lib/audit-log", () => ({ writeAuditLog: mocks.writeAuditLog }));

import { updateCategory } from "./actions";

function form(fields: Record<string, string>) {
  const data = new FormData();
  data.set("name", "Bracciali");
  data.set("slug", "bracciali");
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.requireStaff.mockResolvedValue({ user: { id: "staff1" } });
  mocks.findFirst.mockResolvedValue(null);
  mocks.findUnique.mockResolvedValue({ id: "c1", name: "Bracciali" });
  mocks.update.mockResolvedValue({ id: "c1" });
});

describe("updateCategory descriptions", () => {
  it("requires staff before touching the database", async () => {
    mocks.requireStaff.mockRejectedValue(new Error("NEXT_REDIRECT"));

    await expect(updateCategory("c1", null, form({}))).rejects.toThrow();

    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("saves trimmed copy and stores blank languages as null", async () => {
    await expect(
      updateCategory(
        "c1",
        null,
        form({
          descriptionEn: "  First paragraph.\n\nSecond paragraph.  ",
          descriptionFr: "   ",
        })
      )
    ).rejects.toThrow("NEXT_REDIRECT");

    const { data } = mocks.update.mock.calls[0][0];
    expect(data.descriptionEn).toBe("First paragraph.\n\nSecond paragraph.");
    expect(data.descriptionFr).toBeNull();
    expect(data.description).toBeNull();
    expect(data.descriptionJa).toBeNull();
    expect(mocks.redirect).toHaveBeenCalledWith("/admin/categories");
  });

  it("rejects copy longer than the limit without saving", async () => {
    const result = await updateCategory("c1", null, form({ descriptionEn: "x".repeat(5001) }));

    expect(result).toEqual({ error: expect.any(String) });
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
