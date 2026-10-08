import { describe, expect, it } from "vitest";
import { auth, handlers, signIn } from "./auth-runtime";
import { getLocalAdminSession } from "./admin-session";

describe("public guest authentication", () => {
  it("never accepts a stored customer or staff session", async () => {
    expect(await auth()).toBeNull();
    expect(await getLocalAdminSession()).toBeNull();
  });
  it("has no public login handlers", async () => {
    expect((await handlers.GET()).status).toBe(404);
    expect((await handlers.POST()).status).toBe(404);
    await expect(signIn("credentials", { redirect: false })).rejects.toThrow("local workspace");
  });
});
