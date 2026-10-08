import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ getToken: vi.fn() }));
vi.mock("next-auth/jwt", () => ({ getToken: mocks.getToken }));
vi.mock("./lib/local-features", () => ({
  LOCAL_ACCOUNTS_ENABLED: false,
  isLocalAdminAccess: () => false,
}));
import proxy from "./proxy";

describe("public routing without accounts", () => {
  it.each([
    "/admin",
    "/admin/products",
    "/account",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/en/admin",
    "/it/account/mfa",
    "/fr/login",
  ])("returns 404 for %s before reading even a staff cookie", async (path) => {
    const response = await proxy(
      new NextRequest(`https://store.example${path}`, {
        headers: { cookie: "authjs.session-token=old-staff-session" },
      })
    );
    expect(response.status).toBe(404);
    expect(response.headers.get("location")).toBeNull();
    expect(mocks.getToken).not.toHaveBeenCalled();
  });
  it("keeps locale routing working for the guest storefront", async () => {
    const response = await proxy(new NextRequest("https://store.example/en/products"));
    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-rewrite")).toBe("https://store.example/products");
    expect(mocks.getToken).not.toHaveBeenCalled();
  });
});
