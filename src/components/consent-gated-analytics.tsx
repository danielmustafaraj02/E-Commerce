"use client";

import { useSyncExternalStore } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CONSENT_CHANGED_EVENT, CONSENT_STORAGE_KEY, parseConsent } from "@/lib/consent";

function subscribe(onChange: () => void) {
  window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
  window.addEventListener("storage", onChange); // choice changed in another tab
  return () => {
    window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function analyticsAllowed() {
  try {
    return parseConsent(localStorage.getItem(CONSENT_STORAGE_KEY))?.analytics === true;
  } catch {
    return false; // storage blocked: no recorded consent, so no analytics
  }
}

// Vercel Analytics / Speed Insights only load once the visitor has ticked
// "analytics" in the cookie banner (or pressed Accept all). Before any choice —
// and on the server render — nothing is loaded. Withdrawing consent stops
// tracking from the next page load.
export function ConsentGatedAnalytics() {
  const allowed = useSyncExternalStore(subscribe, analyticsAllowed, () => false);
  if (!allowed) return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
