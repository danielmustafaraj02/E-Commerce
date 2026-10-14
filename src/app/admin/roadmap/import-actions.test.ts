import { beforeEach, describe, expect, it, vi } from "vitest";
import { LAUNCH_CHECKLIST, taskTitle } from "@/lib/launch-checklist";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  createMany: vi.fn(),
  requireAdmin: vi.fn(),
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
  db: { improvementTask: { findMany: mocks.findMany, createMany: mocks.createMany } },
}));
vi.mock("@/lib/require-admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/audit-log", () => ({ writeAuditLog: mocks.writeAuditLog }));

import { importLaunchChecklist, importTranslationTasks } from "./import-actions";
import { TRANSLATION_TASKS } from "@/lib/translation-tasks";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.requireAdmin.mockResolvedValue({ user: { id: "admin1" } });
});

describe("importLaunchChecklist", () => {
  it("is admin-only: it checks the role before touching the database", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("NEXT_REDIRECT"));

    await expect(importLaunchChecklist()).rejects.toThrow();

    expect(mocks.findMany).not.toHaveBeenCalled();
    expect(mocks.createMany).not.toHaveBeenCalled();
  });

  it("creates all 104 tasks on an empty roadmap and logs it", async () => {
    mocks.findMany.mockResolvedValue([]);

    await expect(importLaunchChecklist()).rejects.toThrow("NEXT_REDIRECT");

    const { data } = mocks.createMany.mock.calls[0][0];
    expect(data).toHaveLength(104);
    expect(data.filter((row: { status: string }) => row.status === "done").length).toBe(
      LAUNCH_CHECKLIST.filter((entry) => entry.done).length
    );
    expect(mocks.writeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: "improvementTask.import", after: { created: 104 } })
    );
    expect(mocks.redirect).toHaveBeenCalledWith("/admin/roadmap?imported=104");
  });

  it("only adds what is missing and leaves existing tasks alone", async () => {
    mocks.findMany.mockResolvedValue([
      { title: taskTitle(LAUNCH_CHECKLIST[0]) },
      { title: "A task staff added themselves" },
    ]);

    await expect(importLaunchChecklist()).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.createMany.mock.calls[0][0].data).toHaveLength(103);
    expect(mocks.redirect).toHaveBeenCalledWith("/admin/roadmap?imported=103");
  });

  it("does nothing (and writes no audit entry) when everything is already imported", async () => {
    mocks.findMany.mockResolvedValue(
      LAUNCH_CHECKLIST.map((entry) => ({ title: taskTitle(entry) }))
    );

    await expect(importLaunchChecklist()).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.createMany).not.toHaveBeenCalled();
    expect(mocks.writeAuditLog).not.toHaveBeenCalled();
    expect(mocks.redirect).toHaveBeenCalledWith("/admin/roadmap?imported=0");
  });
});

describe("importTranslationTasks", () => {
  it("is admin-only", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("NEXT_REDIRECT"));
    await expect(importTranslationTasks()).rejects.toThrow();
    expect(mocks.createMany).not.toHaveBeenCalled();
  });

  it("adds one open task per language, given to Claude, each carrying its prompt", async () => {
    mocks.findMany.mockResolvedValue([]);

    await expect(importTranslationTasks()).rejects.toThrow("NEXT_REDIRECT");

    const { data } = mocks.createMany.mock.calls[0][0];
    expect(data).toHaveLength(10);
    for (const row of data) {
      expect(row).toMatchObject({ status: "open", forClaude: true, priority: "medium" });
      expect(row.description).toContain("TASK:");
      expect(row.description).toContain("QUALITY CHECK:");
      expect(row.description).not.toContain("—");
    }
    expect(data.map((row: { title: string }) => row.title)).toContain(
      "Translate the catalog into German (de)"
    );
    expect(data.some((row: { title: string }) => row.title.includes("Italian"))).toBe(false);
    expect(mocks.redirect).toHaveBeenCalledWith("/admin/roadmap?translations=10");
  });

  it("only adds the languages that are missing", async () => {
    mocks.findMany.mockResolvedValue(TRANSLATION_TASKS.slice(0, 7).map((t) => ({ title: t.title })));

    await expect(importTranslationTasks()).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.createMany.mock.calls[0][0].data).toHaveLength(3);
    expect(mocks.redirect).toHaveBeenCalledWith("/admin/roadmap?translations=3");
  });
});
