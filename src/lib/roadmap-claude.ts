import { db } from "@/lib/db";

// Roadmap tasks flagged "for Claude" are worked on by the nightly
// "E-Commerce: Roadmap tasks for Claude" routine (claude.ai/code/routines).
// Each run claims one task through api/automation/roadmap/claim, opens a PR
// and posts its report back through api/automation/roadmap/report, which
// shows up on the Bacheca in Admin > Roadmap.

export const TASK_DETAILS_MAX = 10_000;
export const CLAUDE_REPORT_MAX = 20_000;

// A run that crashed after claiming never reports back; after this long the
// task is up for grabs again instead of being stuck until someone notices.
export const CLAUDE_CLAIM_TTL_MS = 6 * 60 * 60 * 1000;

/** Whether a claim is recent enough that a run is presumably still on it. */
export function isClaimFresh(claimedAt: Date | null, now = Date.now()): boolean {
  return claimedAt !== null && claimedAt.getTime() > now - CLAUDE_CLAIM_TTL_MS;
}

export const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

export type ClaimedTask = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
};

/**
 * Claims the most important open task flagged for Claude that has no report
 * yet (high priority first, then oldest first), or returns null when there is
 * nothing to do. The update is guarded on the same conditions as the lookup,
 * so two runs overlapping can't both claim one task.
 */
export async function claimNextClaudeTask(now = new Date()): Promise<ClaimedTask | null> {
  const claimable = {
    status: "open",
    forClaude: true,
    claudeReport: null,
    OR: [
      { claudeClaimedAt: null },
      { claudeClaimedAt: { lt: new Date(now.getTime() - CLAUDE_CLAIM_TTL_MS) } },
    ],
  };

  const candidates = await db.improvementTask.findMany({
    where: claimable,
    select: { id: true, title: true, description: true, priority: true, createdAt: true },
  });
  candidates.sort(
    (a, b) =>
      (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1) ||
      a.createdAt.getTime() - b.createdAt.getTime()
  );

  for (const task of candidates) {
    const { count } = await db.improvementTask.updateMany({
      where: { id: task.id, ...claimable },
      data: { claudeClaimedAt: now },
    });
    if (count === 1) {
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
      };
    }
  }
  return null;
}
