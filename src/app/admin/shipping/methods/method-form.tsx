"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/form-alert";

export function ShippingMethodForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prevState: unknown, formData: FormData) => Promise<{ error: string | null } | void>;
  initial?: {
    name: string;
    basePrice: number;
    pricePerKg: number;
    estimatedDaysMin: number;
    estimatedDaysMax: number;
    active: boolean;
  };
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
          placeholder="e.g. Standard shipping"
          className="field"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Base price
        <input
          name="basePrice"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={initial ? initial.basePrice / 100 : undefined}
          className="field"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Price per kg (added on top of the base price)
        <input
          name="pricePerKg"
          type="number"
          step="0.01"
          min="0"
          defaultValue={initial ? initial.pricePerKg / 100 : 0}
          className="field"
        />
      </label>
      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Estimated days (min)
          <input
            name="estimatedDaysMin"
            type="number"
            min="1"
            required
            defaultValue={initial?.estimatedDaysMin ?? 2}
            className="field"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Estimated days (max)
          <input
            name="estimatedDaysMax"
            type="number"
            min="1"
            required
            defaultValue={initial?.estimatedDaysMax ?? 5}
            className="field"
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          name="active"
          type="checkbox"
          defaultChecked={initial?.active ?? true}
          className="field-checkbox"
        />
        Active (available at checkout)
      </label>

      {state?.error && <FormAlert type="error">{state.error}</FormAlert>}

      <button type="submit" disabled={pending} className="btn-primary mt-2 w-fit text-sm">
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
