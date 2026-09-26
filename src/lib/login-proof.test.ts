import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LOGIN_PROOF_TTL_SECONDS, createLoginProof, verifyLoginProof } from "./login-proof";

const NOW = 1_800_000_000_000;

describe("login proof", () => {
  beforeEach(() => {
    vi.stubEnv("AUTH_SECRET", "test-secret");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("verifies a fresh proof for the same email (case-insensitively)", () => {
    const proof = createLoginProof("Jane@Example.com", NOW);
    expect(verifyLoginProof("jane@example.com", proof, NOW + 1000)).toBe(true);
  });

  it("is bound to the email it was issued for", () => {
    const proof = createLoginProof("jane@example.com", NOW);
    expect(verifyLoginProof("victim@example.com", proof, NOW)).toBe(false);
  });

  it("expires", () => {
    const proof = createLoginProof("jane@example.com", NOW);
    const justAfter = NOW + (LOGIN_PROOF_TTL_SECONDS + 1) * 1000;
    expect(verifyLoginProof("jane@example.com", proof, justAfter)).toBe(false);
  });

  it("rejects a tampered expiry or signature", () => {
    const proof = createLoginProof("jane@example.com", NOW);
    const [expiresAt, signature] = proof.split(".");
    expect(
      verifyLoginProof("jane@example.com", `${Number(expiresAt) + 9999}.${signature}`, NOW)
    ).toBe(false);
    expect(verifyLoginProof("jane@example.com", `${expiresAt}.${"0".repeat(64)}`, NOW)).toBe(false);
  });

  it("rejects missing or malformed values", () => {
    expect(verifyLoginProof("jane@example.com", undefined, NOW)).toBe(false);
    expect(verifyLoginProof("jane@example.com", "", NOW)).toBe(false);
    expect(verifyLoginProof("jane@example.com", "garbage", NOW)).toBe(false);
    expect(verifyLoginProof("jane@example.com", "1.2.3", NOW)).toBe(false);
  });

  it("rejects a proof signed with a different secret", () => {
    const proof = createLoginProof("jane@example.com", NOW);
    vi.stubEnv("AUTH_SECRET", "another-secret");
    expect(verifyLoginProof("jane@example.com", proof, NOW)).toBe(false);
  });
});
