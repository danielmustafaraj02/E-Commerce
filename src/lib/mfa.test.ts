import { describe, expect, it } from "vitest";
import { generateSync } from "otplib";
import { generateMfaSecret, getMfaUri, verifyMfaToken } from "./mfa";

describe("mfa", () => {
  it("verifies a token generated from the same secret", async () => {
    const secret = generateMfaSecret();
    const token = generateSync({ secret });
    await expect(verifyMfaToken(secret, token)).resolves.toBe(true);
  });

  it("rejects a token generated from a different secret", async () => {
    const secret = generateMfaSecret();
    const otherToken = generateSync({ secret: generateMfaSecret() });
    await expect(verifyMfaToken(secret, otherToken)).resolves.toBe(false);
  });

  it("rejects malformed input without ever hitting the crypto check", async () => {
    const secret = generateMfaSecret();
    await expect(verifyMfaToken(secret, "abc")).resolves.toBe(false);
    await expect(verifyMfaToken(secret, "12345")).resolves.toBe(false);
    await expect(verifyMfaToken(secret, "")).resolves.toBe(false);
  });

  it("builds a valid otpauth:// URI for authenticator apps", () => {
    const uri = getMfaUri("person@example.com", "My Store", "SECRETVALUE");
    expect(uri).toMatch(/^otpauth:\/\/totp\//);
    expect(uri).toContain(encodeURIComponent("person@example.com"));
  });
});
