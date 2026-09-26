import { describe, expect, it } from "vitest";
import { refreshSessionToken } from "./session-refresh";

const NOW = 1_800_000_000_000;
const state = (overrides = {}) => ({
  role: "customer",
  mfaEnabled: false,
  passwordChangedAt: null,
  ...overrides,
});

describe("refreshSessionToken", () => {
  it("picks up the user's current role and MFA state", () => {
    const token = { role: "admin", mfaEnabled: true, authAt: NOW };

    const refreshed = refreshSessionToken(token, state({ role: "customer", mfaEnabled: false }));

    expect(refreshed).toMatchObject({ role: "customer", mfaEnabled: false, authAt: NOW });
  });

  it("promotes as well as demotes", () => {
    const refreshed = refreshSessionToken(
      { role: "customer", authAt: NOW },
      state({ role: "staff" })
    );

    expect(refreshed?.role).toBe("staff");
  });

  it("ends the session when the account no longer exists", () => {
    expect(refreshSessionToken({ role: "admin", authAt: NOW }, null)).toBeNull();
  });

  it("ends a session created before the last password change", () => {
    const changed = new Date(NOW + 1000);

    expect(refreshSessionToken({ authAt: NOW }, state({ passwordChangedAt: changed }))).toBeNull();
  });

  it("keeps a session created after the password change", () => {
    const changed = new Date(NOW - 1000);

    expect(
      refreshSessionToken({ authAt: NOW }, state({ passwordChangedAt: changed }))
    ).not.toBeNull();
  });

  it("treats a token with no authAt as older than any recorded password change", () => {
    expect(refreshSessionToken({}, state({ passwordChangedAt: new Date(NOW) }))).toBeNull();
  });

  it("leaves legacy tokens alone when the password was never changed", () => {
    expect(refreshSessionToken({ role: "customer" }, state())).not.toBeNull();
  });

  it("does not mutate the token it was given", () => {
    const token = { role: "admin", authAt: NOW };
    refreshSessionToken(token, state());

    expect(token.role).toBe("admin");
  });
});
