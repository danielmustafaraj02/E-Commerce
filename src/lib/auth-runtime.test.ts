import { describe, expect, it } from "vitest";
import { getLocalAdminSession } from "./admin-session";

describe("public authentication", () => {
  it("never grants the passwordless local admin session outside the workspace", async () => {
    expect(await getLocalAdminSession()).toBeNull();
  });
});
