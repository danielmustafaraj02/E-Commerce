"use client";

import { useActionState, useRef, useState, type FormEvent } from "react";
import { subscribeToNewsletter } from "@/app/newsletter/actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function NewsletterSignupForm({
  dict,
  submitLabel,
}: {
  dict: Dictionary["footer"];
  submitLabel?: string;
}) {
  const emailRef = useRef<HTMLInputElement>(null);
  const [clientError, setClientError] = useState(false);
  const [emailEdited, setEmailEdited] = useState(false);
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

  const hasError = clientError || (Boolean(state.error) && !emailEdited);

  function validateEmail(event: FormEvent<HTMLFormElement>) {
    if (emailRef.current?.validity.valid) {
      setClientError(false);
      setEmailEdited(false);
      return;
    }

    event.preventDefault();
    setClientError(true);
    emailRef.current?.focus({ preventScroll: true });
  }

  return (
    <form
      action={formAction}
      noValidate
      onSubmit={validateEmail}
      className="flex flex-col gap-2"
    >
      <div className="footer-newsletter-row flex gap-2">
        <input
          ref={emailRef}
          type="email"
          name="email"
          required
          autoComplete="email"
          spellCheck={false}
          aria-label={dict.newsletterTitle}
          aria-invalid={hasError}
          aria-describedby={hasError ? "footer-newsletter-error" : undefined}
          onChange={() => {
            setEmailEdited(true);
            if (emailRef.current?.validity.valid) setClientError(false);
          }}
          placeholder={dict.newsletterPlaceholder}
          className={`field text-sm${hasError ? " newsletter-email--invalid" : ""}`}
        />
        <button type="submit" disabled={pending} className="btn-primary shrink-0 text-sm">
          {pending ? dict.newsletterSubmitting : (submitLabel ?? dict.newsletterSubmit)}
        </button>
      </div>
      {hasError && (
        <p id="footer-newsletter-error" role="alert" className="newsletter-validation">
          <span className="newsletter-validation-mark" aria-hidden="true">
            !
          </span>
          {clientError || state.error === "invalidEmail"
            ? dict.newsletterInvalidEmail
            : dict.newsletterError}
        </p>
      )}
    </form>
  );
}
