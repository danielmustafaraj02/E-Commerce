import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  updateMany: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: { improvementTask: { findMany: mocks.findMany, updateMany: mocks.updateMany } },
}));

import { CLAUDE_CLAIM_TTL_MS, claimNextClaudeTask, isClaimFresh } from "./roadmap-claude";

const now = new Date("2026-09-24T01:00:00Z");

const task = (id: string, priority: string, createdAt: string) => ({
  id,
  title: `Task ${id}`,
  description: null,
  priority,
  createdAt: new Date(createdAt),
});

beforeEach(() => {
  mocks.findMany.mockReset();
  mocks.updateMany.mockReset().mockResolvedValue({ count: 1 });
});

describe("claimNextClaudeTask", () => {
  it("returns null when nothing is flagged for Claude", async () => {
    mocks.findMany.mockResolvedValue([]);

    expect(await claimNextClaudeTask(now)).toBeNull();
    expect(mocks.updateMany).not.toHaveBeenCalled();
  });

  it("only looks at open, flagged, unreported tasks that are unclaimed or stale", async () => {
    mocks.findMany.mockResolvedValue([]);

    await claimNextClaudeTask(now);

    expect(mocks.findMany.mock.calls[0][0].where).toEqual({
      status: "open",
      forClaude: true,
      claudeReport: null,
      OR: [
        { claudeClaimedAt: null },
        { claudeClaimedAt: { lt: new Date(now.getTime() - CLAUDE_CLAIM_TTL_MS) } },
      ],
    });
  });

  it("claims the highest priority first, then the oldest", async () => {
    mocks.findMany.mockResolvedValue([
      task("low-old", "low", "2026-01-01"),
      task("high-new", "high", "2026-09-01"),
      task("high-old", "high", "2026-08-01"),
      task("medium", "medium", "2026-02-01"),
    ]);

    const claimed = await claimNextClaudeTask(now);

    expect(claimed).toEqual({
      id: "high-old",
      title: "Task high-old",
      description: null,
      priority: "high",
    });
    expect(mocks.updateMany).toHaveBeenCalledTimes(1);
    expect(mocks.updateMany.mock.calls[0][0]).toMatchObject({
      where: { id: "high-old", status: "open", forClaude: true, claudeReport: null },
      data: { claudeClaimedAt: now },
    });
  });

  it("moves on to the next task when another run claimed the first one meanwhile", async () => {
    mocks.findMany.mockResolvedValue([
      task("a", "high", "2026-08-01"),
      task("b", "medium", "2026-08-01"),
    ]);
    mocks.updateMany.mockResolvedValueOnce({ count: 0 }).mockResolvedValueOnce({ count: 1 });

    expect((await claimNextClaudeTask(now))?.id).toBe("b");
  });

  it("returns null when every candidate was claimed by another run", async () => {
    mocks.findMany.mockResolvedValue([task("a", "high", "2026-08-01")]);
    mocks.updateMany.mockResolvedValue({ count: 0 });

    expect(await claimNextClaudeTask(now)).toBeNull();
  });
});

describe("isClaimFresh", () => {
  it("is fresh only for a claim younger than the TTL", () => {
    const t = now.getTime();

    expect(isClaimFresh(null, t)).toBe(false);
    expect(isClaimFresh(new Date(t - 60_000), t)).toBe(true);
    expect(isClaimFresh(new Date(t - CLAUDE_CLAIM_TTL_MS - 1), t)).toBe(false);
  });
});
