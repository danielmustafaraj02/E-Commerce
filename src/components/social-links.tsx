// The store's social accounts (Admin > Settings), as small self-drawn line
// icons — no icon font or CDN, and not exact logo reproductions. Only
// platforms with a URL set are shown. Used by the footer and the mobile menu.

export type SocialUrls = {
  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  linkedinUrl: string | null;
};

type Platform = keyof SocialUrls;

const LABELS: Record<Platform, string> = {
  instagramUrl: "Instagram",
  facebookUrl: "Facebook",
  tiktokUrl: "TikTok",
  youtubeUrl: "YouTube",
  linkedinUrl: "LinkedIn",
  twitterUrl: "X",
};

function SocialIcon({ platform }: { platform: Platform }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", "aria-hidden": true as const };
  switch (platform) {
    case "facebookUrl":
      return (
        <svg {...common} fill="currentColor">
          <path d="M14 22v-8h2.7l.4-3.2H14V8.7c0-.9.3-1.6 1.6-1.6H17V4.2C16.6 4.1 15.6 4 14.5 4 12 4 10.3 5.6 10.3 8.4v2.4H7.6V14h2.7v8h3.7Z" />
        </svg>
      );
    case "instagramUrl":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17" cy="7" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      );
    case "twitterUrl":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M4 4l16 16M20 4L4 20" />
        </svg>
      );
    case "tiktokUrl":
      return (
        <svg
          {...common}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5" />
          <path d="M14 4c.4 2.4 2 4 4.5 4.3" />
        </svg>
      );
    case "youtubeUrl":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" />
          <path d="M10.5 9.5v5l4.3-2.5-4.3-2.5Z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "linkedinUrl":
      return (
        <svg {...common} fill="currentColor">
          <rect x="4" y="9" width="3" height="11" />
          <circle cx="5.5" cy="5" r="1.8" />
          <path d="M11 9h3v1.8c.6-1 1.8-2.1 3.5-2.1 2.8 0 4 1.9 4 5V20h-3v-5.7c0-1.5-.5-2.5-1.9-2.5-1.1 0-1.7.7-2 1.4-.1.3-.1.6-.1 1V20h-3V9Z" />
        </svg>
      );
  }
}

export function socialEntries(urls: SocialUrls) {
  return (Object.keys(LABELS) as Platform[])
    .map((platform) => ({ platform, href: urls[platform], label: LABELS[platform] }))
    .filter((e): e is { platform: Platform; href: string; label: string } => Boolean(e.href));
}

export function SocialLinks({ urls, label }: { urls: SocialUrls; label: string }) {
  const entries = socialEntries(urls);
  if (entries.length === 0) return null;
  return (
    <nav aria-label={label}>
      <ul className="social-links">
        {entries.map((entry) => (
          <li key={entry.platform}>
            <a
              href={entry.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={entry.label}
              title={entry.label}
            >
              <SocialIcon platform={entry.platform} />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
