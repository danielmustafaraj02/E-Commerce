"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { login } from "./actions";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { FormAlert } from "@/components/form-alert";
import { PasswordField } from "@/components/password-field";
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
      {googleEnabled && (
        <>
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl })}
            className="btn-secondary"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.9v2.33A9 9 0 009 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.95 10.7A5.4 5.4 0 013.67 9c0-.59.1-1.16.28-1.7V4.97H.9A9 9 0 000 9c0 1.45.35 2.83.9 4.03l3.05-2.33z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.9 4.97l3.05 2.33C4.66 5.17 6.65 3.58 9 3.58z"
              />
            </svg>
            {dict.continueWithGoogle}
          </button>
          <div className="text-foreground/50 flex items-center gap-3 text-xs">
            <div className="bg-foreground/10 h-px flex-1" />
            {dict.or}
            <div className="bg-foreground/10 h-px flex-1" />
          </div>
        </>
      )}

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
