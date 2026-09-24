import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ track: vi.fn() }));
vi.mock("@vercel/analytics", () => ({ track: mocks.track }));

import { trackGiftFinderEvent } from "./gift-finder-analytics";
import { CONSENT_STORAGE_KEY } from "./consent";

const storage = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (key: string) => storage.get(key) ?? null,
});

beforeEach(() => {
  storage.clear();
  mocks.track.mockReset();
});

describe("trackGiftFinderEvent", () => {
  it("sends the event once the visitor has accepted analytics", () => {
    storage.set(CONSENT_STORAGE_KEY, JSON.stringify({ analytics: true, marketing: false }));

    trackGiftFinderEvent("finder_completed", { step: 5 });

    expect(mocks.track).toHaveBeenCalledWith("gift_finder_finder_completed", { step: 5 });
  });

  it("sends nothing without recorded consent", () => {
    trackGiftFinderEvent("finder_opened", {});

    expect(mocks.track).not.toHaveBeenCalled();
  });

  it("sends nothing once analytics consent is explicitly refused", () => {
    storage.set(CONSENT_STORAGE_KEY, JSON.stringify({ analytics: false, marketing: true }));

    trackGiftFinderEvent("added_to_cart", { productId: "p1" });

    expect(mocks.track).not.toHaveBeenCalled();
  });

  it("sends nothing when localStorage access throws", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
    });

    expect(() => trackGiftFinderEvent("purchase", {})).not.toThrow();
    expect(mocks.track).not.toHaveBeenCalled();

    vi.stubGlobal("localStorage", { getItem: (key: string) => storage.get(key) ?? null });
  });
});
