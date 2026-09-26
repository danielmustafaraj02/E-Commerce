"use client";

import { useEffect, useRef, useState } from "react";
import LoginForm from "@/app/login/login-form";
import RegisterForm from "@/app/register/register-form";
import { BrandWave } from "@/components/brand-signature";
import Image from "next/image";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Mode = "login" | "register";
type TransitionPhase = "idle" | "fade-out" | "slide" | "fade-in";

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
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>("idle");
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
    if (next === mode || transitionPhase !== "idle") return;
    switched.current = true;
    window.history.replaceState(null, "", next === "login" ? "/login" : "/register");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMode(next);
      return;
    }

    setTransitionPhase("fade-out");
    window.setTimeout(() => {
      setMode(next);
      if (window.matchMedia("(min-width: 768px)").matches) {
        setTransitionPhase("slide");
        window.setTimeout(() => {
          setTransitionPhase("fade-in");
          window.setTimeout(() => setTransitionPhase("idle"), 260);
        }, 520);
      } else {
        setTransitionPhase("fade-in");
        window.setTimeout(() => setTransitionPhase("idle"), 260);
      }
    }, 220);
  }

  return (
    <div className="auth-panel" data-mode={mode} data-transition-phase={transitionPhase}>
      <div className="auth-form-side">
        <div className="auth-form-content">
          <p className="auth-eyebrow">{storeName}</p>
          <BrandWave className="auth-wave" />
          <h1
            key={mode}
            ref={headingRef}
            tabIndex={-1}
            className="animate-fade-up shop-auth-title outline-none"
          >
            {mode === "login" ? dict.signInTitle : dict.createAccountTitle}
          </h1>
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
                <RegisterForm
                  callbackUrl={callbackUrl}
                  siteKey={siteKey}
                  nonce={nonce}
                  dict={dict}
                  googleEnabled={googleEnabled}
                />
              )}
            </div>
          </div>

          <p className="text-foreground/70 mt-5 text-center text-sm">
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
      </div>
      <div className="auth-image-side">
        <Image
          src="/blog/burano-colorful-houses-canal.jpg"
          alt="Colourful houses reflected in a Venetian canal"
          fill
          priority
          unoptimized
          sizes="(min-width: 768px) 44vw, 100vw"
          className="object-cover"
        />
        <div className="auth-image-wash" />
        <p className="auth-image-caption">{storeName}</p>
      </div>
    </div>
  );
}
