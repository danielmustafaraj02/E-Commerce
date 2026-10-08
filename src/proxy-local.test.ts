import "next/dist/server/node-environment";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getRelativeURL } from "next/dist/shared/lib/router/utils/relativize-url";
import { adapter } from "next/dist/server/web/adapter";
import nextConfig from "../next.config";

vi.mock("next-auth/jwt", () => ({ getToken: vi.fn(async () => null) }));
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_LOCAL_ACCOUNTS = "true";
});
import proxy from "./proxy";
afterEach(() => vi.unstubAllEnvs());

describe("local routing without redirect loops", () => {
  it("keeps the rewrite internal after Next's response adapter processes it", async () => {
    const original = "http://127.0.0.1:3000/en/login?callbackUrl=%2Fadmin";
    const run = () =>
      adapter({
        page: "/proxy",
        handler: proxy,
        request: {
          url: original,
          method: "GET",
          headers: { host: "127.0.0.1:3000" },
          signal: new AbortController().signal,
        },
      });
    // Reproduce the user's external rewrite, including framework processing.
    vi.stubEnv("__NEXT_NO_MIDDLEWARE_URL_NORMALIZE", "");
    const before = await run();
    expect(getRelativeURL(before.response.headers.get("x-middleware-rewrite")!, original)).toBe(
      "http://localhost:3000/login?callbackUrl=%2Fadmin"
    );
    expect(nextConfig.skipProxyUrlNormalize).toBe(true);
    vi.stubEnv("__NEXT_NO_MIDDLEWARE_URL_NORMALIZE", "1");
    const after = await run();
    expect(getRelativeURL(after.response.headers.get("x-middleware-rewrite")!, original)).toBe(
      "/login?callbackUrl=%2Fadmin"
    );
    expect(after.response.headers.get("location")).toBeNull();
  });
  it.each(["127.0.0.1:3000", "localhost:3000", "[::1]:3000"])(
    "keeps the login rewrite internal on %s",
    async (host) => {
      const original = `http://${host}/en/login?callbackUrl=%2Fadmin`;
      const request = new NextRequest(original, { headers: { host } });
      const response = await proxy(request);
      const target = response.headers.get("x-middleware-rewrite")!;
      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
      expect(new URL(target).origin).toBe(new URL(original).origin);
      // This is the same origin check Next uses to choose internal route
      // rendering versus an external server request that re-enters proxy.
      expect(getRelativeURL(target, original)).toBe("/login?callbackUrl=%2Fadmin");
    }
  );
  it("opens localhost admin without a cookie, login redirect or MFA redirect", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const response = await proxy(
      new NextRequest("http://127.0.0.1:3000/admin", {
        headers: { host: "127.0.0.1:3000" },
      })
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
