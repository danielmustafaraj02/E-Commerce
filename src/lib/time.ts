// "A moment `ms` milliseconds ago" for request-time queries (dashboard windows,
// trend charts). The admin pages are server components that run once per
// request, where reading the clock is exactly what's wanted; react-hooks/purity
// flags a bare `Date.now()` inside a component body because it assumes render
// may repeat. Keeping the clock read in a plain helper states the intent once
// instead of scattering lint suppressions.
export function msAgo(ms: number): Date {
  return new Date(Date.now() - ms);
}

export const DAY_MS = 24 * 60 * 60 * 1000;
