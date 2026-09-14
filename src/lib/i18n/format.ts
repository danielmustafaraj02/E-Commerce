// Dictionary entries that need to be resolved with client-only-known values
// (e.g. a shipping method fetched client-side) can't be plain functions —
// functions aren't serializable across the Server->Client Component prop
// boundary. Template strings + this pure formatter sidestep that: only the
// resolved string data crosses the boundary, and this function itself is
// imported directly by whichever side needs it, never passed as a prop.
export function applyTemplate(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}
