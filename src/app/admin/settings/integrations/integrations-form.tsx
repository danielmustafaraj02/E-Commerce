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
  siteUrl,
}: {
  siteUrl: string;
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
          Get an API key at resend.com → API Keys. The &quot;From address&quot; must be on a domain
          you&apos;ve verified in Resend (Domains tab) — an unverified domain will fail to send.
        </p>
        <p className="text-foreground/60 text-xs">
          Without this, order-status, account-verification, and contact-form emails are logged
          instead of sent.
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
          Get both keys at the Cloudflare dashboard → Turnstile → Add site (dash.cloudflare.com,
          free Cloudflare account, no domain transfer needed — just add the site key to a widget).
        </p>
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
          Create a free Redis database at upstash.com → Redis → Create database, then copy the
          &quot;REST URL&quot; and &quot;REST token&quot; from its details page (not the regular
          connection string — this app talks to it over HTTP, not the Redis wire protocol).
        </p>
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
          Create OAuth credentials at console.cloud.google.com/apis/credentials → Create credentials
          → OAuth client ID (type: Web application).
        </p>
        <p className="text-foreground/60 text-xs">
          Adds a &quot;Continue with Google&quot; button to the login and register pages once both
          are set. On that OAuth client, enter exactly:
        </p>
        <dl className="bg-surface text-foreground/80 flex flex-col gap-2 rounded-lg p-3 text-xs">
          <div>
            <dt className="font-medium">Authorized JavaScript origin</dt>
            <dd>
              <code className="break-all">{siteUrl}</code>
            </dd>
          </div>
          <div>
            <dt className="font-medium">Authorized redirect URI</dt>
            <dd>
              <code className="break-all">{siteUrl}/api/auth/callback/google</code>
            </dd>
          </div>
        </dl>
        <p className="text-foreground/60 text-xs">
          Under OAuth consent screen, set the publishing status to <strong>In production</strong> —
          while it says &quot;Testing&quot;, only the test users you list can sign in. Google
          sign-in is not offered to admin, staff or two-factor accounts; they use their password.
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
