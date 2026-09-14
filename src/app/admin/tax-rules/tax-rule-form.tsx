"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/form-alert";

export function TaxRuleForm({
  action,
  initial,
  categories,
  submitLabel,
}: {
  action: (prevState: unknown, formData: FormData) => Promise<{ error: string | null } | void>;
  initial?: {
    name: string;
    country: string;
    region: string;
    ratePercent: number;
    categoryId: string | null;
  };
  categories: { id: string; name: string }[];
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
          placeholder="e.g. IVA standard"
          className="field"
        />
      </label>
      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Country (ISO code)
          <input
            name="country"
            required
            maxLength={2}
            defaultValue={initial?.country}
            placeholder="IT"
            className="field uppercase"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Region (optional)
          <input name="region" defaultValue={initial?.region} className="field" />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        Rate (%)
        <input
          name="ratePercent"
          type="number"
          step="0.01"
          min="0"
          max="100"
          required
          defaultValue={initial?.ratePercent}
          className="field"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Category
        <select name="categoryId" defaultValue={initial?.categoryId ?? ""} className="field">
          <option value="">All categories (store-wide for this country)</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <span className="text-foreground/60 text-xs">
          A category-specific rule overrides the store-wide rule for that country.
        </span>
      </label>

      {state?.error && <FormAlert type="error">{state.error}</FormAlert>}

      <button type="submit" disabled={pending} className="btn-primary mt-2 w-fit text-sm">
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
