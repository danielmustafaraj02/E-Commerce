import { afterEach, describe, expect, it, vi } from "vitest";
afterEach(() => vi.unstubAllEnvs());

async function policy(mode: string, available = "true") {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", mode);
  vi.stubEnv("NEXT_PUBLIC_LOCAL_ACCOUNTS", available);
  return (await import("./local-features")).isLocalAdminAccess;
}
describe("localhost admin access", () => {
  it("permits only loopback hosts in local development", async () => {
    const allowed = await policy("development");
    for (const host of ["localhost:3000", "127.0.0.1:3000", "[::1]:3000"])
      expect(allowed(host)).toBe(true);
    for (const host of [
      null,
      "store.example",
      "192.168.1.10:3000",
      "localhost.evil.example",
      "localhost:3000@evil.example",
    ])
      expect(allowed(host)).toBe(false);
  });
  it("never enables the bypass in production even if an environment flag is set", async () => {
    expect((await policy("production"))("localhost:3000")).toBe(false);
  });
  it("does not enable access without the private local source", async () => {
    expect((await policy("development", "false"))("localhost:3000")).toBe(false);
  });
});
