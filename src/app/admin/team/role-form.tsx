"use client";

import { useActionState } from "react";
import { setUserRole } from "./actions";
import { FormAlert } from "@/components/form-alert";

export function RoleForm({
  defaultEmail,
  defaultRole,
}: {
  defaultEmail?: string;
  defaultRole?: string;
}) {
  const [state, formAction, pending] = useActionState(setUserRole, {
    error: null as string | null,
  });

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          name="email"
          type="email"
          required
          defaultValue={defaultEmail}
          placeholder="person@example.com"
          className="field"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Role
        <select name="role" defaultValue={defaultRole ?? "staff"} className="field">
          <option value="customer">Customer (remove access)</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <button type="submit" disabled={pending} className="btn-primary text-sm">
        {pending ? "Saving..." : "Save role"}
      </button>
      {state.error && (
        <div className="w-full">
          <FormAlert type="error">{state.error}</FormAlert>
        </div>
      )}
    </form>
  );
}
