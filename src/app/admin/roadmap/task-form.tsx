"use client";

import { useActionState } from "react";
import { createImprovementTask } from "./actions";
import { FormAlert } from "@/components/form-alert";

export function TaskForm() {
  const [state, formAction, pending] = useActionState(createImprovementTask, {
    error: null as string | null,
  });

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input name="title" required placeholder="Title" maxLength={200} className="field" />
      <textarea
        name="description"
        rows={2}
        placeholder="Details (optional) — what needs doing, why, and any context a future session would need"
        maxLength={2000}
        className="field"
      />
      <div className="flex gap-3">
        <select name="priority" defaultValue="medium" className="field flex-1">
          <option value="high">High priority</option>
          <option value="medium">Medium priority</option>
          <option value="low">Low priority</option>
        </select>
        <button type="submit" disabled={pending} className="btn-primary shrink-0">
          {pending ? "Adding..." : "Add"}
        </button>
      </div>
      {state?.error && <FormAlert type="error">{state.error}</FormAlert>}
    </form>
  );
}
