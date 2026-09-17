"use client";

import { useActionState, useState } from "react";
import { deleteAccount } from "./actions";
import { FormAlert } from "@/components/form-alert";

// A narrow, plain-data slice of Dictionary["account"] rather than the whole
// object — that object also carries signedInAs(email), a function, and
// functions can't cross the server->client props boundary (Next.js throws
// "Functions cannot be passed directly to Client Components").
type DeleteAccountDict = {
  deleteAccount: string;
  deleteAccountWarning: string;
  currentPassword: string;
  deleting: string;
  confirmDeletion: string;
  cancel: string;
};

export function DeleteAccountForm({ dict }: { dict: DeleteAccountDict }) {
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
