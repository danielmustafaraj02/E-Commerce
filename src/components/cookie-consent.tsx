"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { CONSENT_CHANGED_EVENT, CONSENT_STORAGE_KEY } from "@/lib/consent";

export function CookieConsent({ dict }: { dict: Dictionary["cookieConsent"] }) {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    // Deliberately reading a browser-only API (localStorage) after mount to
    // avoid an SSR/client render mismatch — the lint rule's "don't setState
    // synchronously in an effect" advice doesn't apply to this pattern.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!localStorage.getItem(CONSENT_STORAGE_KEY)) setVisible(true);
    } catch {
      // If storage is unavailable, skip the banner rather than show it forever.
    }
  }, []);

  async function save(choice: { analytics: boolean; marketing: boolean }) {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(choice));
    } catch {
      // Non-fatal — the choice still gets logged server-side.
    }
    // Lets ConsentGatedAnalytics react right away (storage events don't fire
    // in the tab that made the change).
    window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
    setVisible(false);
    try {
      await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(choice),
      });
    } catch {
      // Best-effort logging — don't block the UI on it.
    }
  }

  if (!visible) return null;

  return (
    <div className="border-foreground/10 bg-background animate-fade-up fixed inset-x-0 bottom-0 z-50 border-t p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 text-sm">
        <p className="text-foreground/80">
          {dict.message}{" "}
          <Link href="/legal/cookies" className="underline">
            {dict.cookiePolicy}
          </Link>
          .
        </p>

        {customizing && (
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked disabled className="field-checkbox" />
              {dict.essential}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="field-checkbox"
              />
              {dict.analytics}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="field-checkbox"
              />
              {dict.marketing}
            </label>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => save({ analytics: true, marketing: true })}
            className="btn-primary text-sm"
          >
            {dict.acceptAll}
          </button>
          <button
            type="button"
            onClick={() => save({ analytics: false, marketing: false })}
            className="btn-secondary text-sm"
          >
            {dict.rejectNonEssential}
          </button>
          {customizing ? (
            <button
              type="button"
              onClick={() => save({ analytics, marketing })}
              className="btn-secondary text-sm"
            >
              {dict.savePreferences}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCustomizing(true)}
              className="btn-secondary text-sm"
            >
              {dict.customize}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
