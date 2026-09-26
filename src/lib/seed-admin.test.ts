import { describe, expect, it } from "vitest";
import {
  DEFAULT_ADMIN_EMAIL,
  LEGACY_DEFAULT_PASSWORD,
  SeedConfigError,
  resolveSeedAdmin,
} from "./seed-admin";

describe("resolveSeedAdmin", () => {
  it("never falls back to a fixed password: it generates a fresh random one", () => {
    const first = resolveSeedAdmin({});
    const second = resolveSeedAdmin({});

    expect(first.generated).toBe(true);
    expect(first.password).not.toBe(LEGACY_DEFAULT_PASSWORD);
    expect(first.password).toHaveLength(24);
    expect(first.password).not.toBe(second.password);
    expect(first.email).toBe(DEFAULT_ADMIN_EMAIL);
  });

  it("uses the password and email from the environment when given", () => {
    const admin = resolveSeedAdmin({
      SEED_ADMIN_EMAIL: " owner@shop.test ",
      SEED_ADMIN_PASSWORD: "a-long-enough-password",
    });

    expect(admin).toEqual({
      email: "owner@shop.test",
      password: "a-long-enough-password",
      generated: false,
    });
  });

  it.each(["short", "x".repeat(73)])(
    "rejects a password outside 12–72 characters (%s)",
    (password) => {
      expect(() => resolveSeedAdmin({ SEED_ADMIN_PASSWORD: password })).toThrow(SeedConfigError);
    }
  );

  it("rejects the old published default password even though it is long enough", () => {
    expect(LEGACY_DEFAULT_PASSWORD.length).toBeGreaterThanOrEqual(12);
    expect(() => resolveSeedAdmin({ SEED_ADMIN_PASSWORD: LEGACY_DEFAULT_PASSWORD })).toThrow(
      /old published default/
    );
  });

  it("refuses to run in production", () => {
    expect(() => resolveSeedAdmin({ NODE_ENV: "production" })).toThrow(/production/);
    expect(() =>
      resolveSeedAdmin({ NODE_ENV: "production", SEED_ADMIN_PASSWORD: "a-long-enough-password" })
    ).toThrow(/production/);
  });

  it("in production, only runs when explicitly allowed AND a password is supplied", () => {
    expect(() => resolveSeedAdmin({ NODE_ENV: "production", SEED_ALLOW_PRODUCTION: "1" })).toThrow(
      /SEED_ADMIN_PASSWORD is required/
    );

    const admin = resolveSeedAdmin({
      NODE_ENV: "production",
      SEED_ALLOW_PRODUCTION: "1",
      SEED_ADMIN_PASSWORD: "a-long-enough-password",
    });
    expect(admin.generated).toBe(false);
  });
});
