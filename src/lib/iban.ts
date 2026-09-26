// Checks for the bank details shown to customers who pay by bank transfer. A
// mistyped IBAN sends their money to the wrong account, so the admin form
// refuses one that can't be right (wrong length or failed checksum).

// IBAN length by country (SEPA members and the common others). Countries not
// listed still get the general 15–34 character check plus the checksum.
const IBAN_LENGTH: Record<string, number> = {
  AD: 24,
  AT: 20,
  BE: 16,
  BG: 22,
  CH: 21,
  CY: 28,
  CZ: 24,
  DE: 22,
  DK: 18,
  EE: 20,
  ES: 24,
  FI: 18,
  FR: 27,
  GB: 22,
  GR: 27,
  HR: 21,
  HU: 28,
  IE: 22,
  IS: 26,
  IT: 27,
  LI: 21,
  LT: 20,
  LU: 20,
  LV: 21,
  MC: 27,
  MT: 31,
  NL: 18,
  NO: 15,
  PL: 28,
  PT: 25,
  RO: 24,
  SE: 24,
  SI: 19,
  SK: 24,
  SM: 27,
  VA: 22,
};

/** Upper-case, no spaces or dashes: the form stored and compared. */
export function normalizeIban(value: string): string {
  return value.replace(/[\s-]+/g, "").toUpperCase();
}

/** Groups of four for reading aloud or copying: "IT60 X054 2811 …". */
export function formatIban(value: string): string {
  return normalizeIban(value)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

// ISO 7064 mod 97-10: move the first four characters to the end, turn letters
// into numbers (A=10 … Z=35), and the remainder of the long number must be 1.
function checksumOk(iban: string): boolean {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (const char of rearranged) {
    const digits = /[A-Z]/.test(char) ? String(char.charCodeAt(0) - 55) : char;
    for (const digit of digits) remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1;
}

export function isValidIban(value: string): boolean {
  const iban = normalizeIban(value);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;
  const expected = IBAN_LENGTH[iban.slice(0, 2)];
  if (expected !== undefined && iban.length !== expected) return false;
  return checksumOk(iban);
}

/** BIC/SWIFT: 4 letters (bank), 2 letters (country), 2 alphanumerics (place), optional 3 (branch). */
export function isValidBic(value: string): boolean {
  return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(
    value.replace(/\s+/g, "").toUpperCase()
  );
}
