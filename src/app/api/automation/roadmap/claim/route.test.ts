import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  claim: vi.fn(),
  rateLimit: vi.fn(),
}));

vi.mock("@/lib/roadmap-claude", () => ({ claimNextClaudeTask: mocks.claim }));
vi.mock("@/lib/monitoring", () => ({ captureError: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: mocks.rateLimit, clientIp: () => "203.0.113.7" }));

import { POST } from "./route";

const post = (token = "test-secret") =>
  POST(
    new Request("http://localhost/api/automation/roadmap/claim", {
      method: "POST",
      headers: token ? { authorization: `Bearer ${token}` } : {},
    })
  );

beforeEach(() => {
  mocks.claim.mockReset();
  mocks.rateLimit.mockReset().mockResolvedValue({ success: true, remaining: 19 });
  process.env.AUTOMATION_ROADMAP_TOKEN = "test-secret";
});

afterEach(() => {
  delete process.env.AUTOMATION_ROADMAP_TOKEN;
});

describe("POST /api/automation/roadmap/claim", () => {
  it("rejects a missing or wrong bearer token without claiming anything", async () => {
    expect((await post("wrong")).status).toBe(401);
    expect((await post("")).status).toBe(401);
    expect(mocks.claim).not.toHaveBeenCalled();
  });

  it("returns 204 when there is nothing to work on", async () => {
    mocks.claim.mockResolvedValue(null);

    const response = await post();

    expect(response.status).toBe(204);
  });

  it("returns the claimed task", async () => {
    const task = { id: "t1", title: "Add a size guide", description: "Details", priority: "high" };
    mocks.claim.mockResolvedValue(task);

    const response = await post();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(task);
  });

  it("returns 500 when the database fails", async () => {
    mocks.claim.mockRejectedValue(new Error("db down"));

    expect((await post()).status).toBe(500);
  });

  it("stops a caller that posts too often, before checking the token", async () => {
    mocks.rateLimit.mockResolvedValue({ success: false, remaining: 0 });

    const response = await post("wrong");

    expect(response.status).toBe(429);
    expect(mocks.claim).not.toHaveBeenCalled();
  });
});
