import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  updateMany: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: { improvementTask: { updateMany: mocks.updateMany } },
}));
vi.mock("@/lib/monitoring", () => ({ captureError: vi.fn() }));

import { POST } from "./route";

const post = (body: unknown, token = "test-secret") =>
  POST(
    new Request("http://localhost/api/automation/roadmap/report", {
      method: "POST",
      headers: token ? { authorization: `Bearer ${token}` } : {},
      body: typeof body === "string" ? body : JSON.stringify(body),
    })
  );

beforeEach(() => {
  mocks.updateMany.mockReset().mockResolvedValue({ count: 1 });
  process.env.AUTOMATION_ROADMAP_TOKEN = "test-secret";
});

afterEach(() => {
  delete process.env.AUTOMATION_ROADMAP_TOKEN;
});

describe("POST /api/automation/roadmap/report", () => {
  it("rejects a missing or wrong bearer token", async () => {
    expect((await post({ id: "t1", report: "x" }, "wrong")).status).toBe(401);
    expect((await post({ id: "t1", report: "x" }, "")).status).toBe(401);
    expect(mocks.updateMany).not.toHaveBeenCalled();
  });

  it("saves the report on a task flagged for Claude", async () => {
    const response = await post({ id: "t1", report: "  Main changes: ...  " });

    expect(response.status).toBe(200);
    expect(mocks.updateMany).toHaveBeenCalledWith({
      where: { id: "t1", forClaude: true },
      data: { claudeReport: "Main changes: ...", claudeReportAt: expect.any(Date) },
    });
  });

  it("returns 404 when the task doesn't exist or isn't flagged for Claude", async () => {
    mocks.updateMany.mockResolvedValue({ count: 0 });

    expect((await post({ id: "nope", report: "x" })).status).toBe(404);
  });

  it("rejects a missing id, an empty report, or a report that's too long", async () => {
    expect((await post({ report: "x" })).status).toBe(400);
    expect((await post({ id: "t1" })).status).toBe(400);
    expect((await post({ id: "t1", report: "   " })).status).toBe(400);
    expect((await post({ id: "t1", report: "x".repeat(20_001) })).status).toBe(400);
    expect(mocks.updateMany).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON", async () => {
    expect((await post("not json")).status).toBe(400);
  });
});
