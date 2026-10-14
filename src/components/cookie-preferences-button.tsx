"use client";

import { CONSENT_OPEN_EVENT } from "@/lib/consent";

export function CookiePreferencesButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}
      className="underline"
    >
      {label}
    </button>
  );
}
