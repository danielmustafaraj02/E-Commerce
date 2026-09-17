// Format-only checks (does this look like a real postal code for this
// country), not a live address-verification service — no external API, no
// cost. Catches typos/garbage input; doesn't confirm the address exists or
// is deliverable. Countries not listed fall back to a permissive generic
// pattern rather than rejecting a valid code we don't have a rule for.
const PATTERNS: Record<string, RegExp> = {
  IT: /^\d{5}$/,
  DE: /^\d{5}$/,
  FR: /^\d{5}$/,
  ES: /^\d{5}$/,
  NL: /^\d{4}\s?[A-Za-z]{2}$/,
  BE: /^\d{4}$/,
  AT: /^\d{4}$/,
  CH: /^\d{4}$/,
  PT: /^\d{4}-\d{3}$/,
  US: /^\d{5}(-\d{4})?$/,
  CA: /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/,
  GB: /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}$/,
  AU: /^\d{4}$/,
  JP: /^\d{3}-?\d{4}$/,
  PL: /^\d{2}-\d{3}$/,
  SE: /^\d{3}\s?\d{2}$/,
  DK: /^\d{4}$/,
  NO: /^\d{4}$/,
  FI: /^\d{5}$/,
  CZ: /^\d{3}\s?\d{2}$/,
  GR: /^\d{3}\s?\d{2}$/,
};

const GENERIC_FALLBACK = /^[A-Za-z0-9\- ]{2,12}$/;

export function isValidPostalCode(country: string, postalCode: string): boolean {
  const trimmed = postalCode.trim();
  if (!trimmed) return false;
  const pattern = PATTERNS[country.toUpperCase()];
  return (pattern ?? GENERIC_FALLBACK).test(trimmed);
}
