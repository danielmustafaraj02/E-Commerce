"use client";

import { useActionState } from "react";
import { resendVerificationEmail } from "./actions";
import { FormAlert } from "@/components/form-alert";

export function ResendVerificationForm() {
  const [state, formAction, pending] = useActionState(resendVerificationEmail, {
    error: null as string | null,
    sent: false,
  });

  return (
    <form action={formAction} className="mt-1 flex flex-col gap-2">
      <button type="submit" disabled={pending} className="text-primary text-sm hover:underline">
        {pending ? "Sending..." : "Resend confirmation email"}
      </button>
      {state.sent && <FormAlert type="success">Confirmation email sent — check your inbox.</FormAlert>}
      {state.error && <FormAlert type="error">{state.error}</FormAlert>}
    </form>
  );
}
