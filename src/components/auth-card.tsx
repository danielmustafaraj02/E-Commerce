"use client";

import { useState } from "react";
import LoginForm from "@/app/login/login-form";
import RegisterForm from "@/app/register/register-form";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Mode = "login" | "register";

// Single card behind both /login and /register: switching between them is a
// local state flip with a slide/fade, not a page navigation, so it reads as
// one continuous form rather than two separate pages. The URL is still kept
// in sync (via history.replaceState, not the router) purely so a reload or
// bookmark lands back on the right mode — that history call intentionally
// bypasses Next's router so it can't trigger a re-fetch/remount that would
// cut the animation short.
export function AuthCard({
  initialMode,
  storeName,
  callbackUrl,
  siteKey,
  nonce,
  dict,
  googleEnabled,
  initialError,
  initialNotice,
}: {
  initialMode: Mode;
  storeName: string;
  callbackUrl: string;
  siteKey: string | null;
  nonce?: string;
  dict: Dictionary["auth"];
  googleEnabled: boolean;
  initialError?: string | null;
  initialNotice?: string | null;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);

  function switchTo(next: Mode) {
    if (next === mode) return;
    setMode(next);
    window.history.replaceState(null, "", next === "login" ? "/login" : "/register");
  }

  return (
    <div className="flex flex-col">
      <h1 key={mode} className="animate-fade-up mb-1 text-center text-2xl font-semibold">
        {mode === "login" ? dict.signInTitle : dict.createAccountTitle}
      </h1>
      <p className="text-foreground/60 mb-6 text-center text-sm">{storeName}</p>

      <div className="relative overflow-hidden">
        <div key={mode} data-mode={mode} className="auth-swap-panel">
          {mode === "login" ? (
            <LoginForm
              callbackUrl={callbackUrl}
              siteKey={siteKey}
              nonce={nonce}
              dict={dict}
              googleEnabled={googleEnabled}
              initialError={initialError}
              initialNotice={initialNotice}
            />
          ) : (
            <RegisterForm siteKey={siteKey} nonce={nonce} dict={dict} />
          )}
        </div>
      </div>

      <p className="text-foreground/70 mt-4 text-center text-sm">
        {mode === "login" ? (
          <>
            {dict.noAccount}{" "}
            <a
              href="/register"
              onClick={(e) => {
                e.preventDefault();
                switchTo("register");
              }}
              className="text-primary font-medium underline"
            >
              {dict.createOne}
            </a>
          </>
        ) : (
          <>
            {dict.haveAccount}{" "}
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                switchTo("login");
              }}
              className="text-primary font-medium underline"
            >
              {dict.signIn}
            </a>
          </>
        )}
      </p>
    </div>
  );
}
