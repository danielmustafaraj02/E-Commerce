import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { encode } from "next-auth/jwt";

const local = vi.hoisted(() => ({ admin: false }));
vi.mock("./lib/local-features", () => ({
  LOCAL_ACCOUNTS_ENABLED: true,
  isLocalAdminAccess: () => local.admin,
}));
import proxy from "./proxy";

const secret = "test-current-secret-at-least-32-characters";
const cookieName = "authjs.session-token";
beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("AUTH_SECRET", secret);
  local.admin = false;
});
afterEach(() => vi.unstubAllEnvs());

async function sessionCookie(signingSecret = secret, name = cookieName) {
  return encode({ secret: signingSecret, salt: name, token: { sub: "customer", role: "customer" } });
}

describe("stale session recovery before rendering", () => {
  it.each([false, true])("clears an old-secret cookie (local admin: %s)", async (admin) => {
    local.admin = admin;
    const token = await sessionCookie("previous-secret-at-least-32-characters");
    const response = await proxy(new NextRequest("http://localhost:3000/it/cart", {
      headers: { cookie: `${cookieName}=${token}; cart=keep; locale=it` },
    }));
    expect(response.status).toBe(200);
    const forwarded = response.headers.get("x-middleware-request-cookie");
    expect(forwarded).not.toContain(cookieName);
    expect(forwarded).toContain("cart=keep");
    expect(response.cookies.get(cookieName)?.maxAge).toBe(0);
    expect(response.cookies.get("cart")).toBeUndefined();
  });

  it("preserves a valid JWT and lets the account page render", async () => {
    const cookie = `${cookieName}=${await sessionCookie()}`;
    const response = await proxy(new NextRequest("http://localhost:3000/it/account", {
      headers: { cookie },
    }));
    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-request-cookie")).toBe(cookie);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("expires every invalid cookie chunk on the login redirect", async () => {
    const response = await proxy(new NextRequest("http://localhost:3000/it/account", {
      headers: { cookie: `${cookieName}.0=invalid; ${cookieName}.1=session` },
    }));
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe("/it/login");
    expect(response.cookies.get(`${cookieName}.0`)?.maxAge).toBe(0);
    expect(response.cookies.get(`${cookieName}.1`)?.maxAge).toBe(0);
  });

  it("uses the same legacy secret fallback as Auth.js", async () => {
    vi.stubEnv("AUTH_SECRET", undefined);
    vi.stubEnv("NEXTAUTH_SECRET", secret);
    const response = await proxy(new NextRequest("http://localhost:3000/it/account", {
      headers: { cookie: `${cookieName}=${await sessionCookie()}` },
    }));
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("expires secure production cookies without changing other cookies", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const name = `__Secure-${cookieName}`;
    const response = await proxy(new NextRequest("https://store.example/en/cart", {
      headers: { cookie: `${name}=invalid; cart=keep` },
    }));
    expect(response.cookies.get(name)).toMatchObject({ maxAge: 0, secure: true, httpOnly: true });
    expect(response.headers.get("x-middleware-request-cookie")).toBe("cart=keep");
  });

  // Cached pages (home, catalog, articles…) never read the session, so the
  // proxy does no session work there and sets no cookie: a Set-Cookie on the
  // response would also stop the page being served from the cache.
  it("leaves cookies alone on a cached page", async () => {
    const token = await sessionCookie("previous-secret-at-least-32-characters");
    const response = await proxy(new NextRequest("http://localhost:3000/it", {
      headers: { cookie: `${cookieName}=${token}; cart=keep` },
    }));
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toBeNull();
  });
});
