import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  upsert: vi.fn(),
  requireAdmin: vi.fn(),
  writeAuditLog: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: { storeSettings: { findFirst: mocks.findFirst, upsert: mocks.upsert } },
}));
vi.mock("@/lib/require-admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/audit-log", () => ({ writeAuditLog: mocks.writeAuditLog }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { updateStoreSettings } from "./actions";

function form(extra: Record<string, string> = {}) {
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
