import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/store-settings", () => ({ getStoreSettings: async () => ({}) }));

import { handlers } from "./auth-runtime";
import { getLocalAdminSession } from "./admin-session";

describe("public authentication", () => {
  it("never grants the passwordless local admin session outside the workspace", async () => {
    expect(await getLocalAdminSession()).toBeNull();
  });
  it("exposes real NextAuth route handlers for customer login", () => {
    expect(typeof handlers.GET).toBe("function");
    expect(typeof handlers.POST).toBe("function");
  });
});
