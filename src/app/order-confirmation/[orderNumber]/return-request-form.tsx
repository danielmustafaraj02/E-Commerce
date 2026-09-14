"use client";

import { useActionState, useState } from "react";
import { requestReturn } from "./return-request-actions";
import { FormAlert } from "@/components/form-alert";

export function ReturnRequestForm({ orderNumber }: { orderNumber: string }) {
  const [open, setOpen] = useState(false);
  const boundAction = requestReturn.bind(null, orderNumber);
  const [state, formAction, pending] = useActionState(boundAction, {
    error: null as string | null,
    success: false,
  });

  if (state.success) {
    return <FormAlert type="success">Your return request has been submitted.</FormAlert>;
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary text-sm">
        Request a return
      </button>
    );
  }

  return (
    <form action={formAction} className="form-card animate-fade-up flex flex-col gap-3 text-sm">
      <label className="flex flex-col gap-1.5">
        <span className="font-medium">Reason for return</span>
        <textarea name="reason" required rows={3} className="field" />
      </label>
      {state.error && <FormAlert type="error">{state.error}</FormAlert>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-primary text-sm">
          {pending ? "Submitting..." : "Submit request"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}
