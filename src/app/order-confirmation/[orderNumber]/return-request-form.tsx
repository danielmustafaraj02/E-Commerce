"use client";

import { useActionState, useState } from "react";
import { requestReturn } from "./return-request-actions";
import { FormAlert } from "@/components/form-alert";

type Labels = {
  submitted: string;
  reason: string;
  request: string;
  submit: string;
  sending: string;
  cancel: string;
};

export function ReturnRequestForm({
  orderNumber,
  labels,
}: {
  orderNumber: string;
  labels: Labels;
}) {
  const [open, setOpen] = useState(false);
  const boundAction = requestReturn.bind(null, orderNumber);
  const [state, formAction, pending] = useActionState(boundAction, {
    error: null as string | null,
    success: false,
  });

  if (state.success) {
    return <FormAlert type="success">{labels.submitted}</FormAlert>;
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary text-sm">
        {labels.request}
      </button>
    );
  }

  return (
    <form action={formAction} className="form-card animate-fade-up flex flex-col gap-3 text-sm">
      <label className="flex flex-col gap-1.5">
        <span className="font-medium">{labels.reason}</span>
        <textarea name="reason" required rows={3} className="field" />
      </label>
      {state.error && <FormAlert type="error">{state.error}</FormAlert>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-primary text-sm">
          {pending ? labels.sending : labels.submit}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary text-sm">
          {labels.cancel}
        </button>
      </div>
    </form>
  );
}
