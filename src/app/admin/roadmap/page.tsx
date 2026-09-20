import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  CHECKLIST_CHECKED_ON,
  LAUNCH_CHECKLIST,
  missingChecklistItems,
} from "@/lib/launch-checklist";
import { TaskForm } from "./task-form";
import { toggleImprovementTask, deleteImprovementTask } from "./actions";
import { importLaunchChecklist } from "./import-actions";
import { StatusBadge } from "@/components/status-badge";

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

export default async function AdminRoadmapPage({ searchParams }: PageProps<"/admin/roadmap">) {
  const [tasks, session, params] = await Promise.all([
    db.improvementTask.findMany(),
    auth(),
    searchParams,
  ]);
  const isAdmin = session?.user?.role === "admin";
  const missing = missingChecklistItems(tasks.map((task) => task.title));
  const importedParam = Array.isArray(params.imported) ? params.imported[0] : params.imported;

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
        to read and update directly between sessions instead of losing that context in chat history.
      </p>

      {importedParam !== undefined && (
        <p className="alert alert-success mb-6 text-sm">
          {Number(importedParam) > 0
            ? `Imported ${Number(importedParam)} checklist items.`
            : "The launch checklist was already on the roadmap — nothing to import."}
        </p>
      )}

      {isAdmin && missing.length > 0 && (
        <div className="form-card mb-8 flex flex-col gap-3">
          <div>
            <h2 className="font-medium">Launch checklist</h2>
            <p className="text-foreground/70 mt-1 text-sm">
              {LAUNCH_CHECKLIST.length} items from the README and the site review, each already
              marked done or open based on what was checked on {CHECKLIST_CHECKED_ON} (live site,
              DNS, deployed code).{" "}
              {missing.length === LAUNCH_CHECKLIST.length
                ? "None of them are on the roadmap yet."
                : `${missing.length} aren't on the roadmap yet.`}{" "}
              Importing only adds missing items — it never changes tasks you already have.
            </p>
          </div>
          <form action={importLaunchChecklist}>
            <button type="submit" className="btn-primary">
              Import {missing.length} checklist items
            </button>
          </form>
        </div>
      )}

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
                      <span className="text-foreground/60 text-sm line-through">{task.title}</span>
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
