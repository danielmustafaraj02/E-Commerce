import { db } from "@/lib/db";
import { TaskForm } from "./task-form";
import { toggleImprovementTask, deleteImprovementTask } from "./actions";
import { StatusBadge } from "@/components/status-badge";

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

export default async function AdminRoadmapPage() {
  const tasks = await db.improvementTask.findMany();

  const open = tasks
    .filter((t) => t.status !== "done")
    .sort(
      (a, b) =>
        PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
        b.createdAt.getTime() - a.createdAt.getTime()
    );
  const done = tasks
    .filter((t) => t.status === "done")
    .sort((a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0));

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Roadmap</h1>
      <p className="text-foreground/70 mb-6 max-w-2xl text-sm">
        A shared backlog of site content/config that still needs filling in or revisiting, and
        improvement ideas for later — for staff, and for an AI coding session working on this repo
        to read and update directly between sessions instead of losing that context in chat
        history.
      </p>

      <div className="form-card mb-8">
        <TaskForm />
      </div>

      <div className="flex flex-col gap-6">
        <section>
          <h2 className="text-foreground/70 mb-3 text-sm font-medium tracking-wide uppercase">
            Open ({open.length})
          </h2>
          {open.length === 0 ? (
            <p className="text-foreground/60 text-sm">Nothing open — add an idea above.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {open.map((task) => {
                const boundToggle = toggleImprovementTask.bind(null, task.id);
                const boundDelete = deleteImprovementTask.bind(null, task.id);
                return (
                  <li
                    key={task.id}
                    className="border-foreground/10 bg-surface flex flex-col gap-2 rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={task.priority} />
                        <span className="font-medium">{task.title}</span>
                      </div>
                      <div className="flex shrink-0 gap-3 text-sm">
                        <form action={boundToggle}>
                          <button type="submit" className="text-primary hover:underline">
                            Mark done
                          </button>
                        </form>
                        <form action={boundDelete}>
                          <button type="submit" className="text-danger hover:underline">
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                    {task.description && (
                      <p className="text-foreground/70 text-sm whitespace-pre-wrap">
                        {task.description}
                      </p>
                    )}
                    <span className="text-foreground/40 text-xs">
                      Added {task.createdAt.toLocaleDateString()}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {done.length > 0 && (
          <section>
            <h2 className="text-foreground/70 mb-3 text-sm font-medium tracking-wide uppercase">
              Done ({done.length})
            </h2>
            <ul className="flex flex-col gap-2">
              {done.map((task) => {
                const boundToggle = toggleImprovementTask.bind(null, task.id);
                const boundDelete = deleteImprovementTask.bind(null, task.id);
                return (
                  <li
                    key={task.id}
                    className="border-foreground/10 flex items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <StatusBadge status="done" />
                      <span className="text-foreground/60 text-sm line-through">
                        {task.title}
                      </span>
                    </div>
                    <div className="flex shrink-0 gap-3 text-sm">
                      <form action={boundToggle}>
                        <button type="submit" className="text-primary hover:underline">
                          Reopen
                        </button>
                      </form>
                      <form action={boundDelete}>
                        <button type="submit" className="text-danger hover:underline">
                          Delete
                        </button>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
