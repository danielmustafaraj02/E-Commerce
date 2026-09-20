// Remote image hosts that Next's image optimizer (/_next/image) may fetch and
// re-serve. This used to be `hostname: "**"`, which turns the optimizer into an
// open image proxy anyone can point at any https URL — burning the optimizer
// quota (and bandwidth) for free, and letting your domain serve arbitrary
// remote content.
//
// Admins can still paste an image URL from any host (Admin > Products): images
// from hosts NOT listed here are simply rendered unoptimized, straight from
// their own host, instead of being proxied. To have another host optimized, add
// it to NEXT_PUBLIC_IMAGE_HOSTS (comma-separated, rebuild) — e.g.
// `images.example.com,*.cdn.example.com`.
//
// Pattern syntax matches Next's remotePatterns: `*.x.y` = exactly one subdomain
// label, `**.x.y` = any depth, otherwise an exact hostname.
const DEFAULT_HOSTS = ["loremflickr.com", "*.public.blob.vercel-storage.com"];

export function imageHostPatterns(extra = process.env.NEXT_PUBLIC_IMAGE_HOSTS): string[] {
  const configured = (extra ?? "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
  return [...DEFAULT_HOSTS, ...configured];
}

export function hostMatchesPattern(hostname: string, pattern: string): boolean {
  const host = hostname.toLowerCase();
  if (pattern.startsWith("**.")) return host.endsWith(pattern.slice(2));
  if (pattern.startsWith("*.")) {
    const suffix = pattern.slice(1); // ".x.y"
    return host.endsWith(suffix) && !host.slice(0, -suffix.length).includes(".");
  }
  return host === pattern;
}

// true  -> safe/allowed to go through the optimizer
// false -> render as a plain <img> (no proxying)
export function isOptimizableSrc(src: string, patterns = imageHostPatterns()): boolean {
  // Same-origin path (e.g. /products/...): always ours.
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && patterns.some((p) => hostMatchesPattern(url.hostname, p));
  } catch {
    return false;
  }
}

export function imageRemotePatterns(patterns = imageHostPatterns()) {
  return patterns.map((hostname) => ({ protocol: "https" as const, hostname }));
}
