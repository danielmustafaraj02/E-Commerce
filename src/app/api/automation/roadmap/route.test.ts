import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createTask: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: { improvementTask: { create: mocks.createTask } },
}));
vi.mock("@/lib/monitoring", () => ({ captureError: vi.fn() }));

import { POST } from "./route";

const post = (body: unknown, token = "test-secret") =>
  POST(
    new Request("http://localhost/api/automation/roadmap", {
      method: "POST",
      headers: token ? { authorization: `Bearer ${token}` } : {},
      body: typeof body === "string" ? body : JSON.stringify(body),
    })
  );

beforeEach(() => {
  mocks.createTask.mockReset().mockResolvedValue({ id: "task_1" });
  process.env.AUTOMATION_ROADMAP_TOKEN = "test-secret";
});

afterEach(() => {
  delete process.env.AUTOMATION_ROADMAP_TOKEN;
});

describe("POST /api/automation/roadmap", () => {
  it("rejects a missing or wrong bearer token", async () => {
    expect((await post({ title: "x" }, "wrong")).status).toBe(401);
    expect((await post({ title: "x" }, "")).status).toBe(401);
    expect(mocks.createTask).not.toHaveBeenCalled();
  });

  it("rejects when the secret isn't configured at all", async () => {
    delete process.env.AUTOMATION_ROADMAP_TOKEN;
    expect((await post({ title: "x" })).status).toBe(401);
  });

  it("creates a task with a title only, defaulting priority to medium", async () => {
    const response = await post({ title: "Confirm supplier name for About page" });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ id: "task_1" });
    expect(mocks.createTask).toHaveBeenCalledWith({
      data: {
        title: "Confirm supplier name for About page",
        description: null,
        priority: "medium",
      },
      select: { id: true },
    });
  });

  it("creates a task with description and priority", async () => {
    await post({ title: "Rotate a dependency", description: "npm audit found X", priority: "high" });

    expect(mocks.createTask).toHaveBeenCalledWith({
      data: { title: "Rotate a dependency", description: "npm audit found X", priority: "high" },
      select: { id: true },
    });
  });

  it("rejects a missing, empty, or too-long title", async () => {
    expect((await post({})).status).toBe(400);
    expect((await post({ title: "" })).status).toBe(400);
    expect((await post({ title: "x".repeat(201) })).status).toBe(400);
    expect(mocks.createTask).not.toHaveBeenCalled();
  });

  it("rejects an invalid priority", async () => {
    expect((await post({ title: "x", priority: "urgent" })).status).toBe(400);
  });

  it("rejects malformed JSON", async () => {
    expect((await post("not json")).status).toBe(400);
  });
});
