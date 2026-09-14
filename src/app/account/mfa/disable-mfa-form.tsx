"use client";

import { useActionState } from "react";
import { disableMfa } from "./actions";
import { FormAlert } from "@/components/form-alert";

export function DisableMfaForm() {
  const [state, formAction, pending] = useActionState(disableMfa, { error: null as string | null });

  return (
    <form action={formAction} className="form-card flex max-w-xs flex-col gap-3">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Confirm password to disable</span>
        <input type="password" name="password" required className="field" />
      </label>
      {state?.error && <FormAlert type="error">{state.error}</FormAlert>}
      <button type="submit" disabled={pending} className="btn-danger-outline text-sm">
        {pending ? "Disabling..." : "Disable MFA"}
      </button>
    </form>
  );
}
