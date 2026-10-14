"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/form-alert";

export function EditLegalPageForm({
  action,
  initial,
}: {
  action: (prevState: unknown, formData: FormData) => Promise<{ error: string | null } | void>;
  initial: { title: string; content: string };
}) {
  const [state, formAction, pending] = useActionState(action, { error: null as string | null });

  return (
    <form action={formAction} className="form-card flex max-w-2xl flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Title</span>
        <input name="title" required defaultValue={initial.title} className="field" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Content</span>
        <textarea
          name="content"
          required
          rows={20}
          defaultValue={initial.content}
          className="field font-mono text-sm"
        />
      </label>

      {state?.error && <FormAlert type="error">{state.error}</FormAlert>}

      <button type="submit" disabled={pending} className="btn-primary w-fit text-sm">
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
