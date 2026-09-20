"use client";

import { useActionState } from "react";
import { subscribeToNewsletter } from "@/app/newsletter/actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function NewsletterSignupForm({ dict }: { dict: Dictionary["footer"] }) {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, {
    error: null as "invalidEmail" | "generic" | null,
    success: false,
  });

  if (state.success) {
    return (
      <p role="status" className="text-success text-sm">
        {dict.newsletterSuccess}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          spellCheck={false}
          aria-label={dict.newsletterTitle}
          placeholder={dict.newsletterPlaceholder}
          className="field text-sm"
        />
        <button type="submit" disabled={pending} className="btn-primary shrink-0 text-sm">
          {pending ? dict.newsletterSubmitting : dict.newsletterSubmit}
        </button>
      </div>
      {state.error && (
        <p role="alert" className="text-danger text-xs">
          {state.error === "invalidEmail" ? dict.newsletterInvalidEmail : dict.newsletterError}
        </p>
      )}
    </form>
  );
}
