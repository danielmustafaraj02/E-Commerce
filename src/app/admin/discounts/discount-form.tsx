"use client";

import { useActionState } from "react";
import { createDiscountCode } from "./actions";
import { FormAlert } from "@/components/form-alert";

export function DiscountForm() {
  const [state, formAction, pending] = useActionState(createDiscountCode, {
    error: null as string | null,
  });

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Code
        <input name="code" required className="field w-32 uppercase" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        % off
        <input name="percentOff" type="number" min={0} max={100} className="field w-24" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        or amount off
        <input name="amountOff" type="number" min={0} step="0.01" className="field w-28" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Expires
        <input name="expiresAt" type="date" className="field" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Max uses
        <input name="maxUses" type="number" min={1} className="field w-24" />
      </label>
      <button type="submit" disabled={pending} className="btn-primary text-sm">
        {pending ? "Creating..." : "Create code"}
      </button>
      {state?.error && (
        <div className="w-full">
          <FormAlert type="error">{state.error}</FormAlert>
        </div>
      )}
    </form>
  );
}
