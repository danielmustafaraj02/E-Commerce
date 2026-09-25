"use client";

import { useActionState } from "react";
import { disableMfa } from "./actions";
import { FormAlert } from "@/components/form-alert";

type DisableMfaDict = { confirmPasswordLabel: string; disabling: string; disableButton: string };

export function DisableMfaForm({ dict }: { dict: DisableMfaDict }) {
  const [state, formAction, pending] = useActionState(disableMfa, { error: null as string | null });

  return (
    <form action={formAction} className="form-card flex max-w-xs flex-col gap-3">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">{dict.confirmPasswordLabel}</span>
        <input type="password" name="password" required className="field" />
      </label>
      {state?.error && <FormAlert type="error">{state.error}</FormAlert>}
      <button type="submit" disabled={pending} className="btn-danger-outline text-sm">
        {pending ? dict.disabling : dict.disableButton}
      </button>
    </form>
  );
}
