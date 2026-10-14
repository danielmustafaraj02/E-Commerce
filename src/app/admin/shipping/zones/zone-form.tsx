"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/form-alert";

export function ShippingZoneForm({
  action,
  initial,
  methods,
  submitLabel,
}: {
  action: (prevState: unknown, formData: FormData) => Promise<{ error: string | null } | void>;
  initial?: { name: string; countries: string; methodIds: string[] };
  methods: { id: string; name: string }[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, { error: null as string | null });

  return (
    <form action={formAction} className="form-card flex max-w-lg flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input
          name="name"
          required
          defaultValue={initial?.name}
          placeholder="e.g. European Union"
          className="field"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Countries (ISO codes, comma or space separated)
        <textarea
          name="countries"
          required
          rows={3}
          defaultValue={initial?.countries}
          placeholder="IT, DE, FR, ES"
          className="field font-mono"
        />
      </label>
      <fieldset className="flex flex-col gap-1 text-sm">
        <legend className="mb-1">Available shipping methods</legend>
        {methods.length === 0 && (
          <p className="text-foreground/60">No shipping methods yet — create one first.</p>
        )}
        {methods.map((method) => (
          <label key={method.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              name="methodIds"
              value={method.id}
              defaultChecked={initial?.methodIds.includes(method.id) ?? false}
              className="field-checkbox"
            />
            {method.name}
          </label>
        ))}
      </fieldset>

      {state?.error && <FormAlert type="error">{state.error}</FormAlert>}

      <button type="submit" disabled={pending} className="btn-primary mt-2 w-fit text-sm">
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
