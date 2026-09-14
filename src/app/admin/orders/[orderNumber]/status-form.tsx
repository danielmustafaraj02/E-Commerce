"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/form-alert";

const STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"];

export function StatusForm({
  action,
  currentStatus,
  currentTracking,
  isAdmin,
}: {
  action: (prevState: unknown, formData: FormData) => Promise<{ error: string | null } | void>;
  currentStatus: string;
  currentTracking: string | null;
  isAdmin: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, { error: null as string | null });
  const options = STATUSES.filter((s) => s !== "refunded" || isAdmin);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Status
        <select name="status" defaultValue={currentStatus} className="field">
          {options.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Tracking number
        <input name="trackingNumber" defaultValue={currentTracking ?? ""} className="field" />
      </label>
      {state?.error && <FormAlert type="error">{state.error}</FormAlert>}
      <button type="submit" disabled={pending} className="btn-primary w-fit text-sm">
        {pending ? "Saving..." : "Update order"}
      </button>
    </form>
  );
}
