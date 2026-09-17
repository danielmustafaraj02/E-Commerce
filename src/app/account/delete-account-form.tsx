"use client";

import { useActionState, useState } from "react";
import { deleteAccount } from "./actions";
import { FormAlert } from "@/components/form-alert";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function DeleteAccountForm({ dict }: { dict: Dictionary["account"] }) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, pending] = useActionState(deleteAccount, {
    error: null as string | null,
  });

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="btn-danger-outline text-sm">
        {dict.deleteAccount}
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="border-danger/20 bg-danger/[0.03] flex max-w-sm flex-col gap-3 rounded-xl border p-5"
    >
      <p className="text-foreground/70 text-sm">{dict.deleteAccountWarning}</p>
      <input
        type="password"
        name="password"
        required
        placeholder={dict.currentPassword}
        className="field text-sm"
      />
      {state?.error && <FormAlert type="error">{state.error}</FormAlert>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-danger text-sm">
          {pending ? dict.deleting : dict.confirmDeletion}
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="btn-secondary text-sm">
          {dict.cancel}
        </button>
      </div>
    </form>
  );
}
