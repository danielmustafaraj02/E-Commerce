"use client";

import { useActionState } from "react";
import { updateOfflinePaymentSettings } from "./actions";
import { FormAlert } from "@/components/form-alert";

type Initial = {
  bankTransferEnabled: boolean;
  bankAccountHolder: string;
  bankIban: string;
  bankBic: string;
  codEnabled: boolean;
  codFee: number | null; // cents
};

export function OfflinePaymentsForm({ initial }: { initial: Initial }) {
  const [state, formAction, pending] = useActionState(updateOfflinePaymentSettings, {
    error: null as string | null,
    success: false,
  });

  return (
    <form action={formAction} className="form-card flex max-w-xl flex-col gap-8">
      <fieldset className="border-foreground/10 bg-background/50 flex flex-col gap-4 rounded-lg border p-4">
        <legend className="px-1 font-medium">Bank transfer</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="bankTransferEnabled"
            defaultChecked={initial.bankTransferEnabled}
            className="field-checkbox"
          />
          Offer bank transfer at checkout
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Account holder
          <input
            name="bankAccountHolder"
            defaultValue={initial.bankAccountHolder}
            className="field"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          IBAN
          <input name="bankIban" defaultValue={initial.bankIban} className="field font-mono" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          BIC / SWIFT
          <input name="bankBic" defaultValue={initial.bankBic} className="field font-mono" />
        </label>
      </fieldset>

      <fieldset className="border-foreground/10 bg-background/50 flex flex-col gap-4 rounded-lg border p-4">
        <legend className="px-1 font-medium">Cash on delivery</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="codEnabled"
            defaultChecked={initial.codEnabled}
            className="field-checkbox"
          />
          Offer cash on delivery at checkout
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Surcharge (optional, added to the order total)
          <input
            name="codFee"
            type="number"
            min={0}
            step="0.01"
            defaultValue={initial.codFee !== null ? initial.codFee / 100 : undefined}
            className="field"
          />
        </label>
      </fieldset>

      {state?.error && <FormAlert type="error">{state.error}</FormAlert>}
      {state?.success && <FormAlert type="success">Saved.</FormAlert>}

      <button type="submit" disabled={pending} className="btn-primary w-fit text-sm">
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
