"use client";

import { useActionState } from "react";
import { updateIntegrationSettings, clearIntegrationField } from "./actions";
import { FormAlert } from "@/components/form-alert";

type FieldKey =
  | "resendApiKey"
  | "emailFrom"
  | "turnstileSiteKey"
  | "turnstileSecretKey"
  | "upstashRedisUrl"
  | "upstashRedisToken"
  | "googleClientId"
  | "googleClientSecret";

function Field({
  name,
  label,
  configured,
  type = "password",
  placeholder,
}: {
  name: FieldKey;
  label: string;
  configured: boolean;
  type?: "password" | "text";
  placeholder?: string;
}) {
  const boundClear = clearIntegrationField.bind(null, name);
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="flex items-center justify-between">
        {label}
        {configured && type === "password" && (
          <span className="flex items-center gap-2 text-xs">
            <span className="text-success">configured</span>
            <button type="submit" formAction={boundClear} className="text-danger hover:underline">
              Clear
            </button>
          </span>
        )}
      </span>
      <input
        name={name}
        type={type}
        placeholder={
          type === "password"
            ? configured
              ? "•••••••••••• (saved — leave blank to keep)"
              : "Not set"
            : placeholder
        }
        defaultValue={type === "text" ? placeholder : undefined}
        autoComplete="off"
        className="field font-mono text-sm"
      />
    </label>
  );
}

export function IntegrationsForm({
  configured,
  current,
}: {
  configured: Record<FieldKey, boolean>;
  current: { emailFrom: string; turnstileSiteKey: string; googleClientId: string };
}) {
  const [state, formAction, pending] = useActionState(updateIntegrationSettings, {
    error: null as string | null,
    success: false,
  });

  return (
    <form action={formAction} className="form-card flex max-w-xl flex-col gap-8">
      <fieldset className="border-foreground/10 bg-background/50 flex flex-col gap-4 rounded-lg border p-4">
        <legend className="px-1 font-medium">Email (Resend)</legend>
        <Field name="resendApiKey" label="API key" configured={configured.resendApiKey} />
        <Field
          name="emailFrom"
          label="From address"
          type="text"
          placeholder={current.emailFrom}
          configured={configured.emailFrom}
        />
        <p className="text-foreground/60 text-xs">
          Without this, order-status and contact-form emails are logged instead of sent.
        </p>
      </fieldset>

      <fieldset className="border-foreground/10 bg-background/50 flex flex-col gap-4 rounded-lg border p-4">
        <legend className="px-1 font-medium">Bot protection (Cloudflare Turnstile)</legend>
        <Field
          name="turnstileSiteKey"
          label="Site key"
          type="text"
          placeholder={current.turnstileSiteKey}
          configured={configured.turnstileSiteKey}
        />
        <Field
          name="turnstileSecretKey"
          label="Secret key"
          configured={configured.turnstileSecretKey}
        />
        <p className="text-foreground/60 text-xs">
          Without these, the CAPTCHA widget on login/register/checkout/contact simply doesn&apos;t
          render — verification is skipped, not broken.
        </p>
      </fieldset>

      <fieldset className="border-foreground/10 bg-background/50 flex flex-col gap-4 rounded-lg border p-4">
        <legend className="px-1 font-medium">Rate limiting (Upstash Redis)</legend>
        <Field name="upstashRedisUrl" label="REST URL" configured={configured.upstashRedisUrl} />
        <Field
          name="upstashRedisToken"
          label="REST token"
          configured={configured.upstashRedisToken}
        />
        <p className="text-foreground/60 text-xs">
          Without these, rate limiting falls back to a single-instance in-memory limiter — fine for
          one server, not for multiple.
        </p>
      </fieldset>

      <fieldset className="border-foreground/10 bg-background/50 flex flex-col gap-4 rounded-lg border p-4">
        <legend className="px-1 font-medium">Google sign-in</legend>
        <Field
          name="googleClientId"
          label="Client ID"
          type="text"
          placeholder={current.googleClientId}
          configured={configured.googleClientId}
        />
        <Field
          name="googleClientSecret"
          label="Client secret"
          configured={configured.googleClientSecret}
        />
        <p className="text-foreground/60 text-xs">
          Adds a &quot;Continue with Google&quot; button to the login page once both are set.
          Authorized redirect URI: <code>/api/auth/callback/google</code>.
        </p>
      </fieldset>

      {state?.error && <FormAlert type="error">{state.error}</FormAlert>}
      {state?.success && <FormAlert type="success">Saved.</FormAlert>}

      <button type="submit" disabled={pending} className="btn-primary w-fit text-sm">
        {pending ? "Saving..." : "Save integration settings"}
      </button>
    </form>
  );
}
