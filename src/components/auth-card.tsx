"use client";

import { useEffect, useRef, useState } from "react";
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
  const headingRef = useRef<HTMLHeadingElement>(null);
  const switched = useRef(false);

  // Switching modes unmounts the link that had focus, which would drop keyboard
  // and screen-reader users back at the top of the page. After a switch (not on
  // first load), focus the new heading so the change is announced and the next
  // Tab lands in the new form.
  useEffect(() => {
    if (switched.current) headingRef.current?.focus();
  }, [mode]);

  function switchTo(next: Mode) {
    if (next === mode) return;
    switched.current = true;
    setMode(next);
    window.history.replaceState(null, "", next === "login" ? "/login" : "/register");
  }

  return (
    <div className="flex flex-col">
      <h1
        key={mode}
        ref={headingRef}
        tabIndex={-1}
        className="animate-fade-up shop-auth-title mb-1 text-center outline-none"
      >
        {mode === "login" ? dict.signInTitle : dict.createAccountTitle}
      </h1>
      <p className="text-foreground/60 mb-6 text-center text-sm">{storeName}</p>

      {/* Clips the slide-in animation. The 4px of bottom padding (cancelled by the
            negative margin, so the layout doesn't move) keep the clip edge below the
            card's bottom border: on a card with a fractional height the edge landed
            one pixel too high and cut that border off. */}
      <div className="relative -mb-1 overflow-hidden pb-1">
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
              className="text-accent-deep font-medium underline"
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
              className="text-accent-deep font-medium underline"
            >
              {dict.signIn}
            </a>
          </>
        )}
      </p>
    </div>
  );
}
