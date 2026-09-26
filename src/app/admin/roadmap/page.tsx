import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  CHECKLIST_CHECKED_ON,
  LAUNCH_CHECKLIST,
  missingChecklistItems,
} from "@/lib/launch-checklist";
import { TaskForm } from "./task-form";
import { CopyPromptButton } from "./copy-prompt-button";
import {
  toggleImprovementTask,
  deleteImprovementTask,
  toggleClaudeTask,
  askClaudeAgain,
} from "./actions";
import { importLaunchChecklist, importTranslationTasks } from "./import-actions";
import { missingTranslationTasks, TRANSLATION_TASKS } from "@/lib/translation-tasks";
import { StatusBadge } from "@/components/status-badge";
import { isClaimFresh, PRIORITY_RANK } from "@/lib/roadmap-claude";

// Long details collapse behind "Show details" so the list stays scannable.
const DETAILS_PREVIEW_CHARS = 300;

export default async function AdminRoadmapPage({ searchParams }: PageProps<"/admin/roadmap">) {
  const [tasks, session, params] = await Promise.all([
    db.improvementTask.findMany(),
    auth(),
    searchParams,
  ]);
  const isAdmin = session?.user?.role === "admin";
  const missing = missingChecklistItems(tasks.map((task) => task.title));
  const importedParam = Array.isArray(params.imported) ? params.imported[0] : params.imported;
  const missingTranslations = missingTranslationTasks(tasks.map((task) => task.title));
  const translationsParam = Array.isArray(params.translations)
    ? params.translations[0]
    : params.translations;

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
  const reports = tasks
    .filter((t) => t.claudeReport)
    .sort((a, b) => (b.claudeReportAt?.getTime() ?? 0) - (a.claudeReportAt?.getTime() ?? 0));
  const reportsToCheck = reports.filter((t) => t.status !== "done");
  const reportsChecked = reports.filter((t) => t.status === "done");

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

      {translationsParam !== undefined && (
        <p className="alert alert-success mb-6 text-sm">
          {Number(translationsParam) > 0
            ? `Added ${Number(translationsParam)} translation tasks, one per language.`
            : "The translation tasks were already on the roadmap. Nothing to add."}
        </p>
      )}

      {isAdmin && missingTranslations.length > 0 && (
        <div className="form-card mb-8 flex flex-col gap-3">
          <div>
            <h2 className="font-medium">Translation prompts</h2>
            <p className="text-foreground/70 mt-1 text-sm">
              {TRANSLATION_TASKS.length} tasks, one per language (Italian is the source). Each
              holds the full prompt to translate the catalog into that language and check its
              storefront text, and is given to the nightly Claude routine. Use &ldquo;Take back
              from Claude&rdquo; on any you&apos;d rather run by hand (&ldquo;Copy prompt&rdquo;).
            </p>
          </div>
          <form action={importTranslationTasks}>
            <button type="submit" className="btn-primary">
              Add {missingTranslations.length} translation tasks
            </button>
          </form>
        </div>
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
          <h2 className="text-foreground/70 mb-1 text-sm font-medium tracking-wide uppercase">
            Bacheca — Claude&apos;s reports ({reportsToCheck.length} to check)
          </h2>
          <p className="text-foreground/60 mb-3 text-sm">
            Tasks ticked &ldquo;Use as a prompt for Claude&rdquo; are worked on four times a night,
            one task per run. Each run opens a pull request (nothing goes live until you merge it)
            and writes here what it changed and what to check.
          </p>
          {reportsToCheck.length === 0 ? (
            <p className="text-foreground/60 text-sm">No reports waiting for you.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {reportsToCheck.map((task) => (
                <li
                  key={task.id}
                  className="border-primary/30 bg-surface flex flex-col gap-3 rounded-lg border p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status="claude" />
                      <span className="font-medium">{task.title}</span>
                    </div>
                    <form action={toggleImprovementTask.bind(null, task.id)}>
                      <button
                        type="submit"
                        className="text-primary shrink-0 text-sm hover:underline"
                      >
                        Checked — mark done
                      </button>
                    </form>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{task.claudeReport}</p>
                  <span className="text-foreground/40 text-xs">
                    Reported {task.claudeReportAt?.toLocaleString()}
                  </span>
                  <form
                    action={askClaudeAgain.bind(null, task.id)}
                    className="flex flex-col gap-2 sm:flex-row sm:items-start"
                  >
                    <textarea
                      name="feedback"
                      rows={2}
                      maxLength={10000}
                      placeholder="Not right? Say what to change and Claude tries again next night"
                      className="field flex-1 text-sm"
                    />
                    <button type="submit" className="btn-secondary shrink-0">
                      Ask Claude again
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
          {reportsChecked.length > 0 && (
            <details className="mt-3">
              <summary className="text-foreground/60 cursor-pointer text-sm">
                Checked reports ({reportsChecked.length})
              </summary>
              <ul className="mt-2 flex flex-col gap-2">
                {reportsChecked.map((task) => (
                  <li key={task.id} className="border-foreground/10 rounded-lg border p-3">
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-foreground/70 mt-1 text-sm whitespace-pre-wrap">
                      {task.claudeReport}
                    </p>
                    <span className="text-foreground/40 text-xs">
                      Reported {task.claudeReportAt?.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>

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
                const boundClaude = toggleClaudeTask.bind(null, task.id);
                const claudeWorking =
                  task.forClaude && !task.claudeReport && isClaimFresh(task.claudeClaimedAt);
                return (
                  <li
                    key={task.id}
                    className="border-foreground/10 bg-surface flex flex-col gap-2 rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={task.priority} />
                        {task.forClaude && <StatusBadge status="claude" />}
                        <span className="font-medium">{task.title}</span>
                      </div>
                      <div className="flex shrink-0 flex-wrap justify-end gap-3 text-sm">
                        <CopyPromptButton task={task} />
                        <form action={boundClaude}>
                          <button type="submit" className="text-primary hover:underline">
                            {task.forClaude ? "Take back from Claude" : "Give to Claude"}
                          </button>
                        </form>
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
                    {task.description &&
                      (task.description.length > DETAILS_PREVIEW_CHARS ? (
                        <details className="text-foreground/70 text-sm">
                          <summary className="cursor-pointer">
                            {task.description.slice(0, DETAILS_PREVIEW_CHARS)}… Show details
                          </summary>
                          <p className="mt-2 whitespace-pre-wrap">{task.description}</p>
                        </details>
                      ) : (
                        <p className="text-foreground/70 text-sm whitespace-pre-wrap">
                          {task.description}
                        </p>
                      ))}
                    <details>
                      <summary className="text-primary cursor-pointer text-sm hover:underline">
                        Edit
                      </summary>
                      <div className="mt-3">
                        <TaskForm task={task} />
                      </div>
                    </details>
                    <span className="text-foreground/40 text-xs">
                      Added {task.createdAt.toLocaleDateString()}
                      {claudeWorking &&
                        ` · Claude is working on it (since ${task.claudeClaimedAt!.toLocaleString()})`}
                      {task.forClaude &&
                        task.claudeReport &&
                        " · Claude's report is on the Bacheca"}
                      {task.forClaude &&
                        !task.claudeReport &&
                        !claudeWorking &&
                        " · Waiting for tonight's Claude run"}
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
