import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  requireStaff: vi.fn(),
  writeAuditLog: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mocks.redirect(url);
    throw new Error("NEXT_REDIRECT");
  },
}));
vi.mock("@/lib/db", () => ({
  db: {
    improvementTask: {
      findUnique: mocks.findUnique,
      create: mocks.create,
      update: mocks.update,
    },
  },
}));
vi.mock("@/lib/require-admin", () => ({ requireStaff: mocks.requireStaff }));
vi.mock("@/lib/audit-log", () => ({ writeAuditLog: mocks.writeAuditLog }));

import {
  askClaudeAgain,
  createImprovementTask,
  toggleClaudeTask,
  updateImprovementTask,
} from "./actions";

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.requireStaff.mockResolvedValue({ user: { id: "staff1" } });
  mocks.create.mockResolvedValue({ id: "t1" });
  mocks.update.mockImplementation(async ({ data }) => ({ id: "t1", ...data }));
});

describe("createImprovementTask", () => {
  it("accepts long details and the 'for Claude' checkbox", async () => {
    const details = "x".repeat(9_000);

    await expect(
      createImprovementTask(
        null,
        form({ title: "Size guide", description: details, priority: "high", forClaude: "on" })
      )
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.create).toHaveBeenCalledWith({
      data: { title: "Size guide", description: details, priority: "high", forClaude: true },
    });
  });

  it("leaves the task for humans when the checkbox is unticked", async () => {
    await expect(
      createImprovementTask(null, form({ title: "Call supplier", priority: "low" }))
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.create.mock.calls[0][0].data.forClaude).toBe(false);
  });

  it("rejects details over 30,000 characters", async () => {
    const result = await createImprovementTask(
      null,
      form({ title: "x", description: "x".repeat(30_001), priority: "medium" })
    );

    expect(result).toHaveProperty("error");
    expect(mocks.create).not.toHaveBeenCalled();
  });
});

describe("updateImprovementTask", () => {
  it("checks staff access before touching the database", async () => {
    mocks.requireStaff.mockRejectedValue(new Error("NEXT_REDIRECT"));

    await expect(
      updateImprovementTask("t1", null, form({ title: "x", priority: "low" }))
    ).rejects.toThrow();

    expect(mocks.findUnique).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("saves the edited title, details, priority and Claude flag", async () => {
    mocks.findUnique.mockResolvedValue({ id: "t1", forClaude: false });

    await expect(
      updateImprovementTask(
        "t1",
        null,
        form({ title: "New title", description: "New details", priority: "high", forClaude: "on" })
      )
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: "t1" },
      data: { title: "New title", description: "New details", priority: "high", forClaude: true },
    });
  });

  it("unticking 'for Claude' drops a pending claim and empty details become null", async () => {
    mocks.findUnique.mockResolvedValue({ id: "t1", forClaude: true });

    await expect(
      updateImprovementTask("t1", null, form({ title: "T", description: "", priority: "low" }))
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: "t1" },
      data: {
        title: "T",
        description: null,
        priority: "low",
        forClaude: false,
        claudeClaimedAt: null,
      },
    });
  });

  it("returns an error instead of saving invalid input", async () => {
    mocks.findUnique.mockResolvedValue({ id: "t1", forClaude: false });

    const result = await updateImprovementTask("t1", null, form({ title: "", priority: "low" }));

    expect(result).toHaveProperty("error");
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("returns an error when the task was deleted meanwhile", async () => {
    mocks.findUnique.mockResolvedValue(null);

    const result = await updateImprovementTask("t1", null, form({ title: "x", priority: "low" }));

    expect(result).toEqual({ error: "This task no longer exists" });
  });
});

describe("toggleClaudeTask", () => {
  it("checks staff access before touching the database", async () => {
    mocks.requireStaff.mockRejectedValue(new Error("NEXT_REDIRECT"));

    await expect(toggleClaudeTask("t1")).rejects.toThrow();

    expect(mocks.findUnique).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("flags a task for Claude", async () => {
    mocks.findUnique.mockResolvedValue({ id: "t1", forClaude: false });

    await expect(toggleClaudeTask("t1")).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.update).toHaveBeenCalledWith({ where: { id: "t1" }, data: { forClaude: true } });
  });

  it("unflagging also drops a pending claim", async () => {
    mocks.findUnique.mockResolvedValue({ id: "t1", forClaude: true });

    await expect(toggleClaudeTask("t1")).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: "t1" },
      data: { forClaude: false, claudeClaimedAt: null },
    });
  });
});

describe("askClaudeAgain", () => {
  it("checks staff access before touching the database", async () => {
    mocks.requireStaff.mockRejectedValue(new Error("NEXT_REDIRECT"));

    await expect(askClaudeAgain("t1", form({}))).rejects.toThrow();

    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("clears the report and claim and appends the old report and feedback to the details", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "t1",
      description: "Add a size guide",
      claudeReport: "Added /size-guide. Check it on mobile.",
    });

    await expect(
      askClaudeAgain("t1", form({ feedback: "  Table is too wide on phones  " }))
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: "t1" },
      data: {
        description:
          "Add a size guide\n\n" +
          "--- Previous attempt (Claude's report) ---\nAdded /size-guide. Check it on mobile.\n\n" +
          "--- Owner feedback for the next attempt ---\nTable is too wide on phones",
        forClaude: true,
        status: "open",
        completedAt: null,
        claudeClaimedAt: null,
        claudeReport: null,
        claudeReportAt: null,
      },
    });
  });

  it("copies at most 4,000 characters of the previous report", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "t1",
      description: "Task",
      claudeReport: "r".repeat(10_000),
    });

    await expect(askClaudeAgain("t1", form({}))).rejects.toThrow("NEXT_REDIRECT");

    const description: string = mocks.update.mock.calls[0][0].data.description;
    expect(description.match(/r+$/)?.[0].length).toBe(4_000);
  });

  it("keeps the details unchanged when there is no report and no feedback", async () => {
    mocks.findUnique.mockResolvedValue({ id: "t1", description: "Details", claudeReport: null });

    await expect(askClaudeAgain("t1", form({}))).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.update.mock.calls[0][0].data.description).toBe("Details");
  });
});
