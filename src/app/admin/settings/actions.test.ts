import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  upsert: vi.fn(),
  productFindMany: vi.fn(),
  requireAdmin: vi.fn(),
  writeAuditLog: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    storeSettings: { findFirst: mocks.findFirst, upsert: mocks.upsert },
    product: { findMany: mocks.productFindMany },
  },
}));
vi.mock("@/lib/require-admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/audit-log", () => ({ writeAuditLog: mocks.writeAuditLog }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { updateStoreSettings } from "./actions";

function form(extra: Record<string, string> = {}, pieces: string[] = []) {
  const data = new FormData();
  const fields: Record<string, string> = {
    storeName: "Perla Murano Glass",
    primaryColor: "#123D43",
    secondaryColor: "#4F46E5",
    fontFamily: "Inter",
    defaultCurrency: "EUR",
    defaultLocale: "it-IT",
    contactEmail: "info@example.com",
    ...extra,
  };
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  // One <select> per "why Murano" row, all named the same, in row order.
  for (const piece of pieces) data.append("muranoReasonProductIds", piece);
  return data;
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.requireAdmin.mockResolvedValue({ user: { id: "admin1" } });
  mocks.findFirst.mockResolvedValue({ id: "default", giftCardPrice: 500 });
  mocks.upsert.mockImplementation(async ({ update }) => ({ id: "default", ...update }));
});

describe("updateStoreSettings: personalised gift card", () => {
  it("turns the card on at the price given in euros, and refreshes the site", async () => {
    const result = await updateStoreSettings(
      null,
      form({ giftCardEnabled: "on", giftCardPrice: "7.50" })
    );

    expect(result).toEqual({ error: null, success: true });
    const { update } = mocks.upsert.mock.calls[0][0];
    expect(update.giftCardEnabled).toBe(true);
    expect(update.giftCardPrice).toBe(750);
    // Without this the form snaps back to the old values after saving.
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("turns it off when the box is unticked, keeping the price", async () => {
    await updateStoreSettings(null, form());

    const { update } = mocks.upsert.mock.calls[0][0];
    expect(update.giftCardEnabled).toBe(false);
    expect(update.giftCardPrice).toBe(500);
  });
});

describe("updateStoreSettings: image addresses", () => {
  it("accepts a file on this site as the share image and logo", async () => {
    const result = await updateStoreSettings(
      null,
      form({ ogImageUrl: "/og-image.png", logoUrl: "/logo.png" })
    );
    expect(result).toEqual({ error: null, success: true });
    expect(mocks.upsert.mock.calls[0][0].update.ogImageUrl).toBe("/og-image.png");
  });

  it("still refuses something that is neither a URL nor a path", async () => {
    const result = await updateStoreSettings(null, form({ ogImageUrl: "og image.png" }));
    expect(result.success).toBe(false);
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
});

describe("updateStoreSettings: the pieces beside the why-Murano reasons", () => {
  const stored = () => mocks.upsert.mock.calls[0][0].update.muranoReasonProductIds;

  it("keeps each choice in its own row and stores Automatic as an empty string", async () => {
    mocks.productFindMany.mockResolvedValue([{ id: "a" }, { id: "c" }]);

    const result = await updateStoreSettings(null, form({}, ["a", "", "c"]));

    expect(result).toEqual({ error: null, success: true });
    expect(stored()).toEqual(["a", "", "c"]);
    // Only the chosen pieces are looked up, and only published, visible ones count.
    expect(mocks.productFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ["a", "c"] }, active: true, unlisted: false },
      })
    );
  });

  it("turns a piece that is not published (or does not exist) back into Automatic", async () => {
    mocks.productFindMany.mockResolvedValue([{ id: "a" }]);

    await updateStoreSettings(null, form({}, ["a", "draft-or-ghost", ""]));

    expect(stored()).toEqual(["a", "", ""]);
  });

  it("never lets one piece sit in two rows", async () => {
    mocks.productFindMany.mockResolvedValue([{ id: "a" }, { id: "b" }]);

    await updateStoreSettings(null, form({}, ["a", "a", "b"]));

    expect(stored()).toEqual(["a", "", "b"]);
  });

  it("stores all Automatic, without asking the database, when nothing is chosen", async () => {
    await updateStoreSettings(null, form({}, ["", "", ""]));
    expect(stored()).toEqual(["", "", ""]);

    mocks.upsert.mockClear();
    await updateStoreSettings(null, form());
    expect(stored()).toEqual(["", "", ""]);
    expect(mocks.productFindMany).not.toHaveBeenCalled();
  });

  it("refuses more choices than there are reasons", async () => {
    const result = await updateStoreSettings(null, form({}, ["a", "b", "c", "d"]));
    expect(result.success).toBe(false);
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
});
