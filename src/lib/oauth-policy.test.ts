import { describe, expect, it } from "vitest";
import { oauthSignInBlocked } from "./oauth-policy";

describe("oauthSignInBlocked", () => {
  it("allows a brand-new OAuth user (no existing account)", () => {
    expect(oauthSignInBlocked(null)).toBe(false);
  });

  it("allows an ordinary customer without MFA", () => {
    expect(oauthSignInBlocked({ role: "customer", mfaEnabled: false })).toBe(false);
  });

  it("blocks any account that enrolled in MFA", () => {
    expect(oauthSignInBlocked({ role: "customer", mfaEnabled: true })).toBe(true);
  });

  it("blocks admin and staff regardless of MFA state", () => {
    expect(oauthSignInBlocked({ role: "admin", mfaEnabled: true })).toBe(true);
    expect(oauthSignInBlocked({ role: "admin", mfaEnabled: false })).toBe(true);
    expect(oauthSignInBlocked({ role: "staff", mfaEnabled: false })).toBe(true);
  });
});
