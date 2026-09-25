"use client";

import { useActionState } from "react";
import { confirmMfa } from "./actions";
import { FormAlert } from "@/components/form-alert";

type ConfirmMfaDict = { codeLabel: string; verifying: string; enableButton: string };

export function ConfirmMfaForm({ dict }: { dict: ConfirmMfaDict }) {
  const [state, formAction, pending] = useActionState(confirmMfa, { error: null as string | null });

  return (
    <form action={formAction} className="form-card flex flex-col gap-3">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">{dict.codeLabel}</span>
        <input
          type="text"
          name="code"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          autoFocus
          className="field text-center text-lg tracking-[0.5em]"
        />
      </label>
      {state?.error && <FormAlert type="error">{state.error}</FormAlert>}
      <button type="submit" disabled={pending} className="btn-primary text-sm">
        {pending ? dict.verifying : dict.enableButton}
      </button>
    </form>
  );
}
