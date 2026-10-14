"use client";

import { useActionState } from "react";
import { updateReturnRequest } from "./actions";

const STATUSES = ["requested", "approved", "rejected", "received", "refunded"];

export function ReturnStatusSelect({
  returnRequestId,
  currentStatus,
}: {
  returnRequestId: string;
  currentStatus: string;
}) {
  const boundAction = updateReturnRequest.bind(null, returnRequestId);
  const [state, formAction, pending] = useActionState(boundAction, {
    error: null as string | null,
  });

  return (
    <form action={formAction} className="flex items-center gap-2">
      <select name="status" defaultValue={currentStatus} className="field text-sm">
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <button type="submit" disabled={pending} className="btn-secondary text-xs">
        {pending ? "Saving..." : "Update"}
      </button>
      {state?.error && <span className="text-danger text-xs">{state.error}</span>}
    </form>
  );
}
