"use client";

import { useActionState } from "react";
import { resendVerificationEmail } from "./actions";
import { FormAlert } from "@/components/form-alert";

export function ResendVerificationForm({
  labels,
}: {
  labels: { resend: string; sending: string; sent: string };
}) {
  const [state, formAction, pending] = useActionState(resendVerificationEmail, {
    error: null as string | null,
    sent: false,
  });

  return (
    <form action={formAction} className="mt-1 flex flex-col gap-2">
      <button type="submit" disabled={pending} className="text-primary text-sm hover:underline">
        {pending ? labels.sending : labels.resend}
      </button>
      {state.sent && <FormAlert type="success">{labels.sent}</FormAlert>}
      {state.error && <FormAlert type="error">{state.error}</FormAlert>}
    </form>
  );
}
