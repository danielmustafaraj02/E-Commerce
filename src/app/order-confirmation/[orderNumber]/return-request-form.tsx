"use client";

import { useActionState, useState } from "react";
import type { Locale } from "@/lib/i18n/locale-constants";
import { withdrawalCopy } from "@/lib/withdrawal-copy";
import { requestReturn } from "./return-request-actions";
import { FormAlert } from "@/components/form-alert";

type Labels = {
  submitted: string;
  reason: string;
  request: string;
  submit: string;
  sending: string;
  cancel: string;
};

export function ReturnRequestForm({
  orderNumber,
  labels,
  locale,
  name,
  email,
}: {
  locale: Locale;
  name: string;
  email: string;
  orderNumber: string;
  labels: Labels;
}) {
  const copy = withdrawalCopy(locale);
  const [open, setOpen] = useState(false);
  const boundAction = requestReturn.bind(null, orderNumber);
  const [state, formAction, pending] = useActionState(boundAction, {
    error: null as string | null,
    success: false,
    receipt: undefined as string | undefined,
    emailSent: undefined as boolean | undefined,
  });

  if (state.success) {
    return (
      <div className="flex flex-col gap-3">
        <FormAlert type="success">{copy.submitted}</FormAlert>
        {state.emailSent === false && <p role="status">{copy.emailFailed}</p>}
        {state.receipt && (
          <a
            className="underline"
            download={`withdrawal-${orderNumber}.txt`}
            href={`data:text/plain;charset=utf-8,${encodeURIComponent(state.receipt)}`}
          >
            {copy.download}
          </a>
        )}
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary text-sm">
        {copy.request}
      </button>
    );
  }

  return (
    <form action={formAction} className="form-card animate-fade-up flex flex-col gap-3 text-sm">
      <p>{orderNumber}</p>
      <label className="flex flex-col gap-1.5">
        <span>{copy.name}</span>
        <input
          name="name"
          required
          maxLength={200}
          autoComplete="name"
          defaultValue={name}
          className="field"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span>{copy.email}</span>
        <input
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          defaultValue={email}
          className="field"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-medium">{copy.reason}</span>
        <textarea name="reason" maxLength={2000} rows={3} className="field" />
      </label>
      {state.error && <FormAlert type="error">{state.error}</FormAlert>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-primary text-sm">
          {pending ? labels.sending : copy.confirm}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary text-sm">
          {labels.cancel}
        </button>
      </div>
    </form>
  );
}
