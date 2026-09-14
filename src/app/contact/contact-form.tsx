"use client";

import { useActionState } from "react";
import { sendContactMessage } from "./actions";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { FormAlert } from "@/components/form-alert";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function ContactForm({
  dict,
  siteKey,
  nonce,
}: {
  dict: Dictionary["contact"];
  siteKey: string | null;
  nonce?: string;
}) {
  const [state, formAction, pending] = useActionState(sendContactMessage, {
    error: null as string | null,
    success: false,
  });

  if (state.success) {
    return (
      <div className="form-card">
        <FormAlert type="success">{dict.success}</FormAlert>
      </div>
    );
  }

  return (
    <form action={formAction} className="form-card flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">{dict.formName}</span>
        <input name="name" required className="field" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">{dict.formEmail}</span>
        <input type="email" name="email" required className="field" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">{dict.formMessage}</span>
        <textarea name="message" required rows={5} className="field" />
      </label>
      <TurnstileWidget siteKey={siteKey} nonce={nonce} />
      {state.error && <FormAlert type="error">{state.error}</FormAlert>}
      <button type="submit" disabled={pending} className="btn-primary self-start">
        {pending ? dict.sending : dict.formSubmit}
      </button>
    </form>
  );
}
