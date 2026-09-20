"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitNewPassword, type ResetPasswordState } from "./actions";
import { FormAlert } from "@/components/form-alert";
import { PasswordField } from "@/components/password-field";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const initialState: ResetPasswordState = { error: null };

export default function ResetPasswordForm({
  token,
  dict,
}: {
  token: string;
  dict: Dictionary["auth"];
}) {
  const [state, formAction, pending] = useActionState(submitNewPassword, initialState);

  const message =
    state.error === "invalid"
      ? dict.resetInvalid
      : state.error === "weak"
        ? dict.resetWeak
        : state.error === "generic"
          ? dict.genericError
          : null;

  return (
    <form action={formAction} className="form-card flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <PasswordField
        label={dict.newPassword}
        name="password"
        autoComplete="new-password"
        minLength={8}
        showLabel={dict.showPassword}
      />
      {message && <FormAlert type="error">{message}</FormAlert>}
      {state.error === "invalid" && (
        <Link href="/forgot-password" className="btn-secondary text-center">
          {dict.requestNewLink}
        </Link>
      )}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? dict.resettingPassword : dict.resetPassword}
      </button>
    </form>
  );
}
