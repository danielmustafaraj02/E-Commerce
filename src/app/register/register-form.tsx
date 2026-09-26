"use client";

import { useActionState } from "react";
import { register } from "./actions";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { FormAlert } from "@/components/form-alert";
import { PasswordField } from "@/components/password-field";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export default function RegisterForm({
  callbackUrl,
  siteKey,
  nonce,
  dict,
  googleEnabled,
}: {
  callbackUrl: string;
  siteKey: string | null;
  nonce?: string;
  dict: Dictionary["auth"];
  googleEnabled: boolean;
}) {
  const [state, formAction, pending] = useActionState(register, {
    error: null as string | null,
  });

  return (
    <div className="form-card flex flex-col gap-4">
      {googleEnabled && <GoogleSignInButton callbackUrl={callbackUrl} dict={dict} />}
      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">{dict.name}</span>
          <input type="text" name="name" autoComplete="name" className="field" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">{dict.email}</span>
          <input type="email" name="email" required autoComplete="email" className="field" />
        </label>
        <PasswordField
          label={dict.password}
          name="password"
          autoComplete="new-password"
          minLength={8}
          showLabel={dict.showPassword}
        />
        <TurnstileWidget siteKey={siteKey} nonce={nonce} />
        {state.error && <FormAlert type="error">{state.error}</FormAlert>}
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? dict.creatingAccount : dict.createAccount}
        </button>
      </form>
    </div>
  );
}
