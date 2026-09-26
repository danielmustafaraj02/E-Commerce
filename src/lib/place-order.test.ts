import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ db: { shippingZone: { findFirst: mocks.findFirst } } }));

import { resolveDefaultShippingMethodId } from "./place-order";

beforeEach(() => {
  mocks.findFirst.mockReset();
});

describe("resolveDefaultShippingMethodId", () => {
  it("returns the first active method for the zone", async () => {
    mocks.findFirst.mockResolvedValue({
      methods: [
        { method: { id: "inactive", active: false } },
        { method: { id: "active-1", active: true } },
      ],
    });

    await expect(resolveDefaultShippingMethodId("FR")).resolves.toBe("active-1");
  });

  it("returns null when no zone covers the country", async () => {
    mocks.findFirst.mockResolvedValue(null);

    await expect(resolveDefaultShippingMethodId("XX")).resolves.toBeNull();
  });

  it("returns null when the zone's only methods are all inactive", async () => {
    // A zone can exist for a country while every method on it is disabled
    // (e.g. an admin turns a method off for maintenance). Express Checkout
    // has no manual method picker, so this must be treated the same as "no
    // shipping option for this destination" rather than crashing or picking
    // a disabled method.
    mocks.findFirst.mockResolvedValue({
      methods: [{ method: { id: "disabled-1", active: false } }],
    });

    await expect(resolveDefaultShippingMethodId("US")).resolves.toBeNull();
  });
});
