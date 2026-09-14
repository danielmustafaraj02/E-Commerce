import { describe, expect, it } from "vitest";
import type { Session } from "next-auth";
import { canAccessOrder } from "./orders";

function session(overrides: Partial<Session["user"]>): Session {
  return { user: { id: "u1", role: "customer", ...overrides }, expires: "" } as Session;
}

describe("canAccessOrder", () => {
  it("allows anyone to access a guest order (orderNumber is the bearer token)", () => {
    expect(canAccessOrder({ userId: null }, null)).toBe(true);
  });

  it("allows the owning account", () => {
    expect(canAccessOrder({ userId: "u1" }, session({ id: "u1" }))).toBe(true);
  });

  it("denies a signed-in customer who does not own the order", () => {
    expect(canAccessOrder({ userId: "owner" }, session({ id: "u1", role: "customer" }))).toBe(
      false
    );
  });

  it("denies an unauthenticated visitor on an account-linked order", () => {
    expect(canAccessOrder({ userId: "owner" }, null)).toBe(false);
  });

  it("allows staff and admin regardless of ownership", () => {
    expect(canAccessOrder({ userId: "owner" }, session({ id: "u1", role: "staff" }))).toBe(true);
    expect(canAccessOrder({ userId: "owner" }, session({ id: "u1", role: "admin" }))).toBe(true);
  });
});
