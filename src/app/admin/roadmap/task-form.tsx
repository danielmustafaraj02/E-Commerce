"use client";

import { useActionState } from "react";
import { createImprovementTask, updateImprovementTask } from "./actions";
import { FormAlert } from "@/components/form-alert";

type EditableTask = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  forClaude: boolean;
};

// Adds a new task, or edits `task` when one is passed.
export function TaskForm({ task }: { task?: EditableTask }) {
  const action = task ? updateImprovementTask.bind(null, task.id) : createImprovementTask;
  const [state, formAction, pending] = useActionState(action, {
    error: null as string | null,
  });

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input
        name="title"
        required
        placeholder="Title"
        maxLength={200}
        defaultValue={task?.title}
        className="field"
      />
      <textarea
        name="description"
        rows={task ? 10 : 6}
        placeholder="Details (optional) — what needs doing, why, and any context a future session would need"
        maxLength={30000}
        defaultValue={task?.description ?? undefined}
        className="field"
      />
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          name="forClaude"
          defaultChecked={task?.forClaude}
          className="mt-0.5"
        />
        <span>
          Use as a prompt for Claude — a nightly run picks it up, opens a PR with the change and
          writes what it did and what to check on the Bacheca.
        </span>
      </label>
      <div className="flex gap-3">
        <select name="priority" defaultValue={task?.priority ?? "medium"} className="field flex-1">
          <option value="high">High priority</option>
          <option value="medium">Medium priority</option>
          <option value="low">Low priority</option>
        </select>
        <button type="submit" disabled={pending} className="btn-primary shrink-0">
          {task ? (pending ? "Saving..." : "Save") : pending ? "Adding..." : "Add"}
        </button>
      </div>
      {state?.error && <FormAlert type="error">{state.error}</FormAlert>}
    </form>
  );
}
