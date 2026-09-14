"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/form-alert";

export function CategoryForm({
  action,
  initial,
  categories,
  submitLabel,
}: {
  action: (prevState: unknown, formData: FormData) => Promise<{ error: string | null } | void>;
  initial?: { name: string; slug: string; parentId: string | null };
  categories: { id: string; name: string }[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, { error: null as string | null });

  return (
    <form action={formAction} className="form-card flex max-w-lg flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Name</span>
        <input name="name" required defaultValue={initial?.name} className="field" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Slug</span>
        <input
          name="slug"
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          defaultValue={initial?.slug}
          placeholder="e.g. home-goods"
          className="field"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Parent category</span>
        <select name="parentId" defaultValue={initial?.parentId ?? ""} className="field">
          <option value="">None (top-level)</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      {state?.error && <FormAlert type="error">{state.error}</FormAlert>}

      <button type="submit" disabled={pending} className="btn-primary mt-2 w-fit text-sm">
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
