"use client";

import { useActionState } from "react";
import { Link } from "@/components/localized-link";
import { login } from "./actions";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { FormAlert } from "@/components/form-alert";
import { PasswordField } from "@/components/password-field";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export default function LoginForm({
  callbackUrl,
  siteKey,
  nonce,
  dict,
  googleEnabled,
  initialError,
  initialNotice,
}: {
  callbackUrl: string;
  siteKey: string | null;
  nonce?: string;
  dict: Dictionary["auth"];
  googleEnabled: boolean;
  initialError?: string | null;
  initialNotice?: string | null;
}) {
  const [state, formAction, pending] = useActionState(login, {
    error: null as string | null,
    mfaRequired: false,
  });

  return (
    <div className="form-card flex flex-col gap-4">
      {googleEnabled && <GoogleSignInButton callbackUrl={callbackUrl} dict={dict} />}

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">{dict.email}</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            spellCheck={false}
            className="field"
          />
        </label>
        <PasswordField
          label={dict.password}
          name="password"
          autoComplete="current-password"
          minLength={8}
          showLabel={dict.showPassword}
        />
        <Link
          href="/forgot-password"
          className="text-foreground/60 -mt-2 self-end text-xs hover:underline"
        >
          {dict.forgotPassword}
        </Link>
        {state.mfaRequired && (
          <label className="animate-fade-up flex flex-col gap-1.5 text-sm">
            <span className="font-medium">{dict.authenticatorCode}</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              name="totpCode"
              spellCheck={false}
              required
              autoFocus
              autoComplete="one-time-code"
              className="field text-center text-lg tracking-[0.5em]"
            />
          </label>
        )}
        <TurnstileWidget siteKey={siteKey} nonce={nonce} />
        {initialNotice && !state.error && <FormAlert type="success">{initialNotice}</FormAlert>}
        {(state.error ?? initialError) && (
          <FormAlert type="error">{state.error ?? initialError}</FormAlert>
        )}
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? dict.signingIn : dict.signIn}
        </button>
      </form>
    </div>
  );
}
