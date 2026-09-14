"use client";

import { useActionState } from "react";
import { register } from "./actions";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { FormAlert } from "@/components/form-alert";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export default function RegisterForm({
  siteKey,
  nonce,
  dict,
}: {
  siteKey: string | null;
  nonce?: string;
  dict: Dictionary["auth"];
}) {
  const [state, formAction, pending] = useActionState(register, {
    error: null as string | null,
  });

  return (
    <form action={formAction} className="form-card flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">{dict.name}</span>
        <input type="text" name="name" autoComplete="name" className="field" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">{dict.email}</span>
        <input type="email" name="email" required autoComplete="email" className="field" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">{dict.password}</span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="field"
        />
      </label>
      <TurnstileWidget siteKey={siteKey} nonce={nonce} />
      {state.error && <FormAlert type="error">{state.error}</FormAlert>}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? dict.creatingAccount : dict.createAccount}
      </button>
    </form>
  );
}
