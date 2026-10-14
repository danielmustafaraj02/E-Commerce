import { beforeEach, describe, expect, it, vi } from "vitest";

const access = vi.hoisted(() => vi.fn());
vi.mock("@/lib/local-features", () => ({ isLocalAdminAccess: access }));
import { GET } from "./route";
beforeEach(() => vi.resetAllMocks());

describe("local standalone template canvas", () => {
  it("returns a layout-free canvas without editor, header or sidebar markup", async () => {
    access.mockReturnValue(true);
    const response = GET(
      new Request("http://localhost:3000/api/admin/template-capture", {
        headers: { host: "localhost:3000" },
      })
    );
    const html = await response.text();
    expect(response.status).toBe(200);
    expect(html).toContain("data-template-capture-page");
    expect(html).not.toMatch(/<nav|<header|<aside|<script|<button|admin-ui/);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(access).toHaveBeenCalledWith("localhost:3000");
  });
  it("is unavailable when local admin access is disabled", () => {
    access.mockReturnValue(false);
    expect(
      GET(
        new Request("https://store.example/api/admin/template-capture", {
          headers: { host: "store.example" },
        })
      ).status
    ).toBe(404);
  });
});
