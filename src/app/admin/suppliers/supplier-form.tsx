"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/form-alert";

export function SupplierForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prevState: unknown, formData: FormData) => Promise<{ error: string | null } | void>;
  initial?: { name: string; email: string; website: string; notes: string };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, { error: null as string | null });

  return (
    <form action={formAction} className="form-card flex max-w-lg flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input name="name" required defaultValue={initial?.name} className="field" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Email (where fulfillment requests are sent)
        <input name="email" type="email" defaultValue={initial?.email} className="field" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Website
        <input
          name="website"
          type="url"
          placeholder="https://"
          defaultValue={initial?.website}
          className="field"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Notes
        <textarea name="notes" rows={3} defaultValue={initial?.notes} className="field" />
      </label>

      {state?.error && <FormAlert type="error">{state.error}</FormAlert>}

      <button type="submit" disabled={pending} className="btn-primary mt-2 w-fit text-sm">
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
