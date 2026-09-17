// Self-referencing hreflang: this site serves both languages from the same
// URL (locale is cookie/Accept-Language driven, see src/lib/i18n/locale.ts),
// which is Google's documented "dynamic serving" pattern — same URL for
// every language, paired with a `Vary: Accept-Language` response header
// (see src/proxy.ts). Real locale-prefixed URLs (/en/, /it/) would be a
// stronger signal but are a bigger routing change; this is the correct,
// honest markup for the current architecture.
export function hreflangAlternates(canonicalPath: string): Record<string, string> {
  return { en: canonicalPath, it: canonicalPath, "x-default": canonicalPath };
}
