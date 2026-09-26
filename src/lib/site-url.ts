// The public base URL of the store, with no trailing slash. Resolution order
// matches sitemap.ts, robots.ts, layout.tsx and the feed: the Admin > Settings
// value, then NEXTAUTH_URL, then localhost for local development.
//
// Use this (never `settings.siteUrl || ""`) anywhere an *absolute* URL is
// required — structured data, emails, feeds. When the admin setting is empty,
// `|| ""` quietly produces relative URLs: invalid in JSON-LD, and links with no
// domain in an email.
export function siteBaseUrl(settings: { siteUrl: string | null }): string {
  return (settings.siteUrl || process.env.NEXTAUTH_URL || "http://localhost:3000").replace(
    /\/+$/,
    ""
  );
}
