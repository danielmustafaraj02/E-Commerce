import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ track: vi.fn() }));
vi.mock("@vercel/analytics", () => ({ track: mocks.track }));

import { trackLookEvent } from "./look-analytics";
import { CONSENT_STORAGE_KEY } from "./consent";

const storage = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (key: string) => storage.get(key) ?? null,
});

beforeEach(() => {
  storage.clear();
  mocks.track.mockReset();
});

describe("trackLookEvent", () => {
  it("sends the event once the visitor has accepted analytics", () => {
    storage.set(CONSENT_STORAGE_KEY, JSON.stringify({ analytics: true, marketing: false }));

    trackLookEvent("added_to_cart", { lookId: "look1", pieces: 3 });

    expect(mocks.track).toHaveBeenCalledWith("complete_the_look_added_to_cart", {
      lookId: "look1",
      pieces: 3,
    });
  });

  it("sends nothing without analytics consent", () => {
    trackLookEvent("viewed", { lookId: "look1" });
    storage.set(CONSENT_STORAGE_KEY, JSON.stringify({ analytics: false, marketing: true }));
    trackLookEvent("viewed", { lookId: "look1" });

    expect(mocks.track).not.toHaveBeenCalled();
  });
});
