import { describe, expect, it } from "vitest";
import {
  CHECKLIST_CHECKED_ON,
  LAUNCH_CHECKLIST,
  missingChecklistItems,
  taskTitle,
  toTaskRows,
} from "./launch-checklist";

describe("LAUNCH_CHECKLIST", () => {
  it("has exactly 100 items", () => {
    expect(LAUNCH_CHECKLIST).toHaveLength(100);
  });

  it("has unique titles once the area prefix is added", () => {
    const titles = LAUNCH_CHECKLIST.map(taskTitle);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("fits the roadmap's field limits and uses valid priorities", () => {
    for (const entry of LAUNCH_CHECKLIST) {
      expect(taskTitle(entry).length, taskTitle(entry)).toBeLessThanOrEqual(200);
      expect(entry.detail.length, entry.title).toBeGreaterThan(0);
      expect(entry.detail.length, entry.title).toBeLessThanOrEqual(2000);
      expect(["high", "medium", "low"]).toContain(entry.priority);
    }
  });

  it("says where each 'done' claim was checked", () => {
    // Every done item must point at evidence, not just assert completion.
    const vague = LAUNCH_CHECKLIST.filter(
      (entry) =>
        entry.done &&
        !/checked|in the deployed code|in place|deployed|shipped|self-service|tests? pass|zero lint|fix is|also commits|only written/i.test(
          entry.detail
        )
    ).map((entry) => entry.title);
    expect(vague).toEqual([]);
  });

  it("mixes done and open items, with the open high-priority work easy to find", () => {
    const done = LAUNCH_CHECKLIST.filter((entry) => entry.done).length;
    expect(done).toBeGreaterThan(20);
    expect(LAUNCH_CHECKLIST.length - done).toBeGreaterThan(40);
    expect(LAUNCH_CHECKLIST.some((entry) => !entry.done && entry.priority === "high")).toBe(true);
  });

  it("records when it was checked", () => {
    expect(CHECKLIST_CHECKED_ON).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("missingChecklistItems", () => {
  it("returns everything when the roadmap is empty", () => {
    expect(missingChecklistItems([])).toHaveLength(100);
  });

  it("skips items already on the roadmap, matching by exact title", () => {
    const have = [
      taskTitle(LAUNCH_CHECKLIST[0]),
      taskTitle(LAUNCH_CHECKLIST[5]),
      "Some other task",
    ];

    const missing = missingChecklistItems(have);

    expect(missing).toHaveLength(98);
    expect(missing).not.toContain(LAUNCH_CHECKLIST[0]);
  });

  it("returns nothing once everything is imported", () => {
    expect(missingChecklistItems(LAUNCH_CHECKLIST.map(taskTitle))).toEqual([]);
  });
});

describe("toTaskRows", () => {
  const now = new Date("2026-09-20T12:00:00Z");

  it("marks done items done with a completion time, and open items open without one", () => {
    const rows = toTaskRows(LAUNCH_CHECKLIST, now);
    const done = rows.find((row, i) => LAUNCH_CHECKLIST[i].done)!;
    const open = rows.find((row, i) => !LAUNCH_CHECKLIST[i].done)!;

    expect(done).toMatchObject({ status: "done", completedAt: now });
    expect(open).toMatchObject({ status: "open", completedAt: null });
  });

  it("keeps the written order: earlier items get later creation times", () => {
    const rows = toTaskRows(LAUNCH_CHECKLIST.slice(0, 3), now);

    expect(rows[0].createdAt.getTime()).toBeGreaterThan(rows[1].createdAt.getTime());
    expect(rows[1].createdAt.getTime()).toBeGreaterThan(rows[2].createdAt.getTime());
  });

  it("carries the title, detail and priority through", () => {
    const [row] = toTaskRows([LAUNCH_CHECKLIST[0]], now);

    expect(row).toMatchObject({
      title: taskTitle(LAUNCH_CHECKLIST[0]),
      description: LAUNCH_CHECKLIST[0].detail,
      priority: LAUNCH_CHECKLIST[0].priority,
    });
  });
});
