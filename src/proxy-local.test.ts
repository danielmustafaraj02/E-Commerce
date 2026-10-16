import "next/dist/server/node-environment";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { adapter } from "next/dist/server/web/adapter";
import nextConfig from "../next.config";

vi.mock("next-auth/jwt", () => ({ getToken: vi.fn(async () => null) }));
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_LOCAL_ACCOUNTS = "true";
  // As if the private local session module were installed (see next.config.ts).
  process.env.LOCAL_ADMIN_SOURCE = "true";
});
import proxy from "./proxy";
afterEach(() => vi.unstubAllEnvs());

describe("local routing without redirect loops", () => {
  // Prefixed URLs map onto app/[locale]/… directly: the proxy passes them
  // through, with no rewrite that could re-enter it and no redirect.
  it.each(["127.0.0.1:3000", "localhost:3000", "[::1]:3000"])(
    "serves a locale-prefixed page in place on %s",
    async (host) => {
      const original = `http://${host}/en/login?callbackUrl=%2Fadmin`;
      const response = await proxy(new NextRequest(original, { headers: { host } }));
      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
      expect(response.headers.get("x-middleware-rewrite")).toBeNull();
      expect(response.headers.get("x-middleware-next")).toBe("1");
    }
  );
  it("goes through Next's response adapter unchanged", async () => {
    const original = "http://127.0.0.1:3000/en/login?callbackUrl=%2Fadmin";
    const { response } = await adapter({
      page: "/proxy",
      handler: proxy,
      request: {
        url: original,
        method: "GET",
        headers: { host: "127.0.0.1:3000" },
        signal: new AbortController().signal,
      },
    });
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(response.headers.get("location")).toBeNull();
    expect(nextConfig.skipProxyUrlNormalize).toBe(true);
  });
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
