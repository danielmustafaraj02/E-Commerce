import { describe, expect, it } from "vitest";
import { explicitDatabaseSslMode, isTransientDbError } from "./db";

describe("explicitDatabaseSslMode", () => {
  it.each(["prefer", "require", "verify-ca"])("makes %s verification explicit", (mode) => {
    const url = new URL(
      explicitDatabaseSslMode(
        `postgresql://user:pass@localhost/store?sslmode=${mode}&channel_binding=require`
      )
    );
    expect(url.searchParams.get("sslmode")).toBe("verify-full");
    expect(url.searchParams.get("channel_binding")).toBe("require");
  });

  it.each([
    "postgresql://localhost/store",
    "postgresql://localhost/store?sslmode=disable",
    "postgresql://localhost/store?sslmode=verify-full",
    "postgresql://localhost/store?sslmode=require&uselibpqcompat=true",
  ])("preserves explicit or local settings: %s", (url) => {
    expect(explicitDatabaseSslMode(url)).toBe(url);
  });
});

describe("isTransientDbError", () => {
  it("recognises connection problems", () => {
    expect(isTransientDbError({ code: "P1001" })).toBe(true);
    expect(isTransientDbError({ code: "P2024" })).toBe(true);
    expect(isTransientDbError(new Error("Connection terminated unexpectedly"))).toBe(true);
    expect(isTransientDbError(new Error("read ECONNRESET"))).toBe(true);
  });
  it("does not retry real query errors", () => {
    expect(isTransientDbError({ code: "P2002" })).toBe(false);
    expect(isTransientDbError(new Error("Unique constraint failed"))).toBe(false);
    expect(isTransientDbError(null)).toBe(false);
  });
});
