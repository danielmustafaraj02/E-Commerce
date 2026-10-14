"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/form-alert";

export function FulfillmentTrackingForm({
  action,
  currentStatus,
  currentTracking,
}: {
  action: (prevState: unknown, formData: FormData) => Promise<{ error: string | null } | void>;
  currentStatus: string;
  currentTracking: string | null;
}) {
  const [state, formAction, pending] = useActionState(action, { error: null as string | null });

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 text-sm">
      <label className="flex flex-col gap-1">
        Status
        <select name="status" defaultValue={currentStatus} className="field">
          <option value="sent">sent</option>
          <option value="shipped">shipped</option>
          <option value="delivered">delivered</option>
        </select>
      </label>
      <label className="flex flex-col gap-1">
        Tracking number
        <input name="trackingNumber" defaultValue={currentTracking ?? ""} className="field" />
      </label>
      <button type="submit" disabled={pending} className="btn-primary text-sm">
        {pending ? "Saving..." : "Update"}
      </button>
      {state?.error && (
        <div className="w-full">
          <FormAlert type="error">{state.error}</FormAlert>
        </div>
      )}
    </form>
  );
}
