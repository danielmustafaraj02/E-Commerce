# Self-Service Password Reset — Build Guide

## Why this is the single most important item on the list

Every other item on the 20-item checklist below is about making the store
faster, more profitable, or better protected against external threats. This
one is different: **without it, a locked-out customer has no way back in.**

Here is what happens today when a customer forgets their password:

1. They click "Login", type their email, type a wrong password.
2. After 5 failed attempts the account locks for 15 minutes (this is
   already wired in `src/auth.ts`).
3. They look for a "Forgot password?" link. There isn't one.
4. They either abandon the session (lost sale, lost lifetime value) or
   send a support message to you, which costs your time and theirs.

That is the business case. The security case is just as strong: without
a self-service flow, the only recovery path is "email the admin" — which
means password resets happen over unstructured email threads with no
token expiry, no audit trail, and no protection against social engineering.
A formal token-based flow is strictly safer than the informal workaround
people will use in its absence.

No other item on the list removes an active blocker for paying customers
*and* closes a security gap at the same time. That is why it goes first.

---

## The 20-item checklist (ordered by impact)

### Security
- [ ] 1. **Self-service password reset** — this guide. Active blocker for locked-out customers.
- [ ] 2. Make the GitHub repo private — currently public; source code and config comments are visible to anyone.
- [ ] 3. Set `STRIPE_*` / `PAYPAL_*` in production — checkout exists but cannot take real payments.
- [ ] 4. Set `UPSTASH_REDIS_*` — rate limiting falls back to in-memory without these; in-memory doesn't survive restarts and doesn't scale across Vercel instances.
- [ ] 5. Set `TURNSTILE_*` — bot protection is wired but inactive; login and registration are currently unguarded.
- [ ] 6. Mandatory admin/staff MFA — done. Keep enforcing it as the team grows.
- [ ] 7. Business/cyber insurance + incident-response plan — non-technical but the financial backstop for everything else.

### Money / conversion
- [ ] 8. Set `RESEND_API_KEY` / `EMAIL_FROM` — order confirmation emails aren't sending; customers have no receipt.
- [ ] 9. Free-shipping progress bar — done.
- [ ] 10. Resolve the VAT/OSS gap deliberately — cross-border EU sales have a compliance exposure until this is addressed.
- [ ] 11. Post-purchase review-request email automation — reviews build trust and SEO; no automation means no reviews.
- [ ] 12. Cross-sell "goes well with" shelf on product pages — cheap to add, reuses the best-sellers query already in the codebase.
- [ ] 13. Wishlist / save-for-later — doesn't exist yet; strong retargeting signal, especially for gifting occasions.
- [ ] 14. "Recently viewed" shelf — doesn't exist yet; cookie/localStorage-driven, cheap to add.

### Marketing
- [ ] 15. Newsletter welcome series + segment past-purchasers vs. never-purchased.
- [ ] 16. Second/third abandoned-cart email touch — currently a single reminder; most revenue from cart abandonment comes from the second touch.
- [ ] 17. Google Merchant Center feed — Product structured data exists in `src/lib/json-ld.ts`; verify and extend for Shopping.
- [ ] 18. Meta/Instagram Shopping catalog setup — strong channel fit for visual jewelry products.
- [ ] 19. Referral program ("give €10, get €10") — word-of-mouth acquisition at a fixed cost per customer.
- [ ] 20. Birthday/gift-occasion email capture and reminders — high-intent trigger for jewelry purchases.

---

## How to build it — step by step

The full feature is six steps: extend the database schema, write two server
actions (request token + consume token), build two pages, link "Forgot
password?" on the login page, and show a success banner after redirect.
Everything slots into the existing codebase — no new dependencies needed.

---

### Step 1 — Add two columns to the User table

Open `prisma/schema.prisma` and add two nullable fields inside the `User`
model, alongside the existing auth fields:

```prisma
model User {
  // ... existing fields ...

  passwordResetToken  String?   @unique  // SHA-256 hash of the raw token
  passwordResetExpiry DateTime?           // token is invalid after this time
}
```

Then generate and apply the migration:

```bash
npx prisma migrate dev --name add-password-reset-token
```

> **Why store a hashed token and not the raw one?**
> Same reason you hash passwords. If the database leaks, an attacker
> who finds a raw token in the `passwordResetToken` column can
> immediately use it to take over the account. A SHA-256 hash is
> useless to them without the original. The raw token lives only in
> the email link; the database never sees it.

---

### Step 2 — Write the "request reset" server action

Create the file `src/app/forgot-password/actions.ts`:

```ts
"use server";

import crypto from "crypto";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function requestPasswordReset(formData: FormData) {
  // Rate-limit by IP — 5 attempts per 15 minutes prevents email flooding
  // and makes it much harder to enumerate registered addresses at scale.
  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  const { success } = await rateLimit(`pwd-reset:${ip}`, 5, 900);
  if (!success) return { error: "Too many requests. Try again in 15 minutes." };

  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: "Invalid email address." };

  const { email } = parsed.data;

  // Look up the user but do NOT reveal whether the address is registered.
  // Both the "found" and "not found" paths return { success: true } so an
  // attacker cannot use this endpoint to confirm which emails have accounts.
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    // No account, or an OAuth-only account with no password to reset.
    // Return success silently — same response the real path returns.
    return { success: true };
  }

  // Generate 32 random bytes (256 bits of entropy).
  // rawToken goes into the email link; hashedToken is stored in the DB.
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

  await db.user.update({
    where: { id: user.id },
    data: { passwordResetToken: hashedToken, passwordResetExpiry: expiry },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${rawToken}`;

  await sendEmail({
    to: email,
    subject: "Reset your password",
    text: [
      "Click the link below to reset your password.",
      "The link expires in 1 hour.",
      "",
      resetUrl,
      "",
      "If you didn't request this, ignore this email — your password has not changed.",
    ].join("\n"),
  });

  return { success: true };
}
```

---

### Step 3 — Write the "set new password" server action

Create `src/app/reset-password/actions.ts`:

```ts
"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  // Token is exactly 64 hex characters (32 bytes).
  // Reject anything else before touching the DB.
  token: z.string().min(64).max(64),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function setNewPassword(formData: FormData) {
  const parsed = schema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { token, password } = parsed.data;

  // Hash the incoming token the same way it was stored — find by hash,
  // not by the raw value (which never enters the DB).
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await db.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpiry: { gt: new Date() }, // reject expired tokens
    },
  });

  if (!user) {
    return {
      error: "This reset link is invalid or has expired. Please request a new one.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,  // one-time use — burn the token immediately
      passwordResetExpiry: null,
      // If the forgotten password caused failed login attempts and a lockout,
      // clear those too — the user has just proven email ownership.
      failedLoginCount: 0,
      lockedUntil: null,
    },
  });

  return { success: true };
}
```

---

### Step 4 — Build the two pages

#### 4a — "Forgot password" page

Create `src/app/forgot-password/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await requestPasswordReset(formData);
    if (result.success) {
      setStatus("sent");
    } else {
      setErrorMsg(result.error ?? "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-semibold">Check your email</h1>
        <p className="text-gray-600">
          If that address is registered, you will receive a reset link within
          a few minutes. Check your spam folder if it doesn't arrive.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-6 text-2xl font-semibold">Forgot your password?</h1>
      <p className="mb-6 text-gray-600">
        Enter your email and we will send you a link to reset it.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        {status === "error" && (
          <p className="text-sm text-red-600">{errorMsg}</p>
        )}
        <button
          type="submit"
          className="w-full rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          Send reset link
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-500">
        Remembered it?{" "}
        <a href="/login" className="underline">
          Back to login
        </a>
      </p>
    </main>
  );
}
```

#### 4b — "Set new password" page

Create `src/app/reset-password/page.tsx`:

```tsx
"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { setNewPassword } from "./actions";

// Separated into its own component because useSearchParams() requires a
// Suspense boundary in Next.js App Router — the parent can't use it directly.
function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("token", token);
    const result = await setNewPassword(formData);
    if (result.success) {
      router.push("/login?reset=success");
    } else {
      setError(result.error ?? "Something went wrong.");
    }
  }

  if (!token) {
    return (
      <p className="text-red-600">
        Invalid reset link — no token found. Please{" "}
        <a href="/forgot-password" className="underline">
          request a new one
        </a>
        .
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        className="w-full rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white"
      >
        Set new password
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-6 text-2xl font-semibold">Set a new password</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
```

---

### Step 5 — Add "Forgot password?" to the login page

Open `src/app/login/login-form.tsx` and add this link directly below the
password input field:

```tsx
<div className="text-right text-sm">
  <a
    href="/forgot-password"
    className="text-gray-500 underline hover:text-gray-900"
  >
    Forgot password?
  </a>
</div>
```

---

### Step 6 — Show a success banner after the redirect

After a successful reset, `reset-password/page.tsx` redirects to
`/login?reset=success`. Open `src/app/login/page.tsx` and read that param to
show a one-time confirmation so the user knows the reset worked:

```tsx
// login/page.tsx is a Server Component — searchParams is available as a prop.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      {params.reset === "success" && (
        <div className="mx-auto mt-8 max-w-md rounded bg-green-50 px-4 py-3 text-sm text-green-800">
          Password updated — please sign in with your new password.
        </div>
      )}
      {/* existing login form component */}
    </>
  );
}
```

---

## Pre-ship checklist

Before deploying, confirm every item below:

- [ ] `RESEND_API_KEY` and `EMAIL_FROM` are set (Admin → Settings → Integrations, or `.env`). Without these `sendEmail()` logs and skips silently — the user never receives the link.
- [ ] `NEXTAUTH_URL` is set to the correct public domain in production. This is used to build the reset link inside the email.
- [ ] Migration deployed to the production database: `npx prisma migrate deploy`.
- [ ] `UPSTASH_REDIS_URL` + `UPSTASH_REDIS_TOKEN` set so the rate limiter is durable across Vercel instances.
- [ ] Manual happy-path test: request reset → email arrives → click link → set password → log in successfully.
- [ ] Expired-token test: request a reset, then manually set `passwordResetExpiry` to a past date in Prisma Studio (`npm run db:studio`), then click the link — confirm "invalid or expired" message appears.
- [ ] Token-reuse test: complete a successful reset, then try the same link again — confirm it is rejected.
- [ ] Enumeration test: submit the form with an email address that has no account — confirm the response is visually identical to the success case.

---

## Why this implementation is secure

| Attack vector | How it is blocked |
|---|---|
| Brute-forcing the token | 32 random bytes = 256 bits of entropy. Not feasible. |
| Database leak exposing tokens | Only the SHA-256 hash is stored. Raw token exists only in the email. |
| Reusing a spent token | Token is set to `null` immediately after a successful reset. |
| Using an old link | `passwordResetExpiry` enforces a 1-hour window. |
| Email flooding / account enumeration | Same response for known and unknown addresses. IP rate-limited to 5/15 min. |
| Bypassing account lockout via reset | `failedLoginCount` and `lockedUntil` are cleared on success — intentionally, since email ownership is now proven. |
