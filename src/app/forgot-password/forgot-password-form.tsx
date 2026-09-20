"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestReset, type ForgotPasswordState } from "./actions";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { FormAlert } from "@/components/form-alert";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const initialState: ForgotPasswordState = { status: "idle", error: null };

export default function ForgotPasswordForm({
  siteKey,
  nonce,
  dict,
}: {
  siteKey: string | null;
  nonce?: string;
  dict: Dictionary["auth"];
}) {
  const [state, formAction, pending] = useActionState(requestReset, initialState);

  if (state.status === "sent") {
    return (
      <div className="form-card flex flex-col gap-4">
        <FormAlert type="success">{dict.resetLinkSent}</FormAlert>
        <Link href="/login" className="btn-secondary text-center">
          {dict.backToSignIn}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="form-card flex flex-col gap-4">
      <p className="text-foreground/70 text-sm">{dict.forgotPasswordIntro}</p>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">{dict.email}</span>
        <input type="email" name="email" required autoComplete="email" className="field" />
      </label>
      <TurnstileWidget siteKey={siteKey} nonce={nonce} />
      {state.error && <FormAlert type="error">{dict.genericError}</FormAlert>}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? dict.sendingResetLink : dict.sendResetLink}
      </button>
      <Link href="/login" className="text-foreground/60 text-center text-sm hover:underline">
        {dict.backToSignIn}
      </Link>
    </form>
  );
}
