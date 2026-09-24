import { track } from "@vercel/analytics";
import { CONSENT_STORAGE_KEY, parseConsent } from "@/lib/consent";

// Complete-the-look funnel events for Vercel Analytics (custom events), sent
// only with analytics consent — the same rule as consent-gated-analytics.tsx.
export type LookEvent = "viewed" | "selected" | "added_to_cart" | "purchased";

export function trackLookEvent(event: LookEvent, props: Record<string, string | number>) {
  try {
    if (parseConsent(localStorage.getItem(CONSENT_STORAGE_KEY))?.analytics !== true) return;
  } catch {
    return; // storage blocked: no recorded consent
  }
  track(`complete_the_look_${event}`, props);
}
