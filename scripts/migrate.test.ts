import { describe, expect, it } from "vitest";
import { shouldMigrate } from "./migrate.mjs";

describe("shouldMigrate", () => {
  it("migrates production deploys and builds outside Vercel", () => {
    expect(shouldMigrate({ VERCEL_ENV: "production" })).toBe(true);
    expect(shouldMigrate({})).toBe(true);
  });

  it("leaves the database alone for preview deploys", () => {
    expect(shouldMigrate({ VERCEL_ENV: "preview" })).toBe(false);
  });

  it("migrates previews only when they have their own database", () => {
    expect(shouldMigrate({ VERCEL_ENV: "preview", MIGRATE_PREVIEWS: "1" })).toBe(true);
  });
});
