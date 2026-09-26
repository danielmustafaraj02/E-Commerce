// Shared by the cookie banner (which writes the visitor's choice) and
// ConsentGatedAnalytics (which obeys it). Kept dependency-free so both can
// import it in the browser.
export const CONSENT_STORAGE_KEY = "cookie-consent";
// Fired on the banner's own window after a choice is saved: the native
// `storage` event only reaches *other* tabs, never the one that wrote.
export const CONSENT_CHANGED_EVENT = "cookie-consent-changed";

export type ConsentChoice = { analytics: boolean; marketing: boolean };

// Strict on purpose: anything that isn't exactly the shape the banner writes
// counts as "no consent given", never as consent.
export function parseConsent(raw: string | null): ConsentChoice | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === "object" &&
      value !== null &&
      typeof (value as ConsentChoice).analytics === "boolean" &&
      typeof (value as ConsentChoice).marketing === "boolean"
    ) {
      const { analytics, marketing } = value as ConsentChoice;
      return { analytics, marketing };
    }
  } catch {
    // fall through
  }
  return null;
}
