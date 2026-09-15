"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/form-alert";
import { sendNewsletterCampaign } from "./actions";

export function CampaignForm({ subscriberCount }: { subscriberCount: number }) {
  const [state, formAction, pending] = useActionState(sendNewsletterCampaign, { error: null });

  return (
    <form action={formAction} className="form-card flex max-w-lg flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Subject
        <input name="subject" required maxLength={200} className="field" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Message
        <textarea name="message" required rows={8} maxLength={10000} className="field" />
      </label>

      {state.error && <FormAlert type="error">{state.error}</FormAlert>}
      {state.sent !== undefined && (
        <FormAlert type="success">
          Sent to {state.sent} subscriber{state.sent === 1 ? "" : "s"}
          {state.failed ? `, ${state.failed} failed` : ""}.
        </FormAlert>
      )}

      <button
        type="submit"
        disabled={pending || subscriberCount === 0}
        className="btn-primary mt-2 w-fit text-sm"
      >
        {pending ? "Sending..." : `Send to ${subscriberCount} subscriber${subscriberCount === 1 ? "" : "s"}`}
      </button>
    </form>
  );
}
