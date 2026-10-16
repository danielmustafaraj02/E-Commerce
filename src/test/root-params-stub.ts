// Vitest stand-in for `next/root-params`, a module the Next compiler replaces
// (imported as-is it throws). No route is rendering in a unit test, so there
// is no [locale] segment: getLocale() falls back to its header/cookie path.
export async function locale(): Promise<string | undefined> {
  return undefined;
}
