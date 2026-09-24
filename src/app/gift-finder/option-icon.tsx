// Small, simple line icons for the Gift Finder's selectable option cards —
// deliberately abstract (no stock photos of people; the catalog has none),
// same stroke convention as components/trust-badges.tsx and
// components/gift-finder-arrow.tsx (round caps/joins, currentColor).
export type OptionIconName =
  | "heart"
  | "star"
  | "sparkle"
  | "ring"
  | "band"
  | "drop"
  | "diamond"
  | "asterisk"
  | "bolt"
  | "layers"
  | "question"
  | "tag";

const SHARED = {
  width: "26",
  height: "26",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function OptionIcon({ name }: { name: OptionIconName }) {
  switch (name) {
    case "heart":
      return (
        <svg {...SHARED}>
          <path d="M12 20.5s-7-4.4-9.3-8.6C1.1 8.7 2.3 5 5.8 5c2 0 3.6 1.3 6.2 4 2.6-2.7 4.2-4 6.2-4 3.5 0 4.7 3.7 3.1 6.9-2.3 4.2-9.3 8.6-9.3 8.6z" />
        </svg>
      );
    case "star":
      return (
        <svg {...SHARED}>
          <path d="M12 2.5 14.6 9l6.9.6-5.2 4.6 1.6 6.8L12 17.6l-6 3.4 1.6-6.8-5.2-4.6L9.4 9 12 2.5z" />
        </svg>
      );
    case "sparkle":
      return (
        <svg {...SHARED}>
          <path d="M12 2.5c.6 3.4 2 5.3 5.5 6-3.4.6-5.3 2-6 5.5-.6-3.4-2-5.3-5.5-6 3.4-.6 5.3-2 6-5.5z" />
          <path d="M18.5 15c.3 1.7 1 2.5 2.7 2.8-1.7.3-2.5 1-2.8 2.7-.3-1.7-1-2.5-2.7-2.8 1.7-.3 2.5-1 2.8-2.7z" />
        </svg>
      );
    case "ring":
      return (
        <svg {...SHARED}>
          <circle cx="12" cy="15" r="5.5" />
          <path d="M8.5 10 12 3l3.5 7" />
        </svg>
      );
    case "band":
      return (
        <svg {...SHARED}>
          <ellipse cx="12" cy="12" rx="9" ry="5.5" />
          <ellipse cx="12" cy="12" rx="3.5" ry="2.2" />
        </svg>
      );
    case "drop":
      return (
        <svg {...SHARED}>
          <circle cx="12" cy="7.5" r="3" />
          <path d="M12 10.5v4" />
          <path d="M9.2 14.5a2.8 2.8 0 1 0 5.6 0" />
        </svg>
      );
    case "diamond":
      return (
        <svg {...SHARED}>
          <path d="M6.5 3h11L21 9l-9 12L3 9l3.5-6z" />
          <path d="M3 9h18M9 3l-2.5 6L12 21l5.5-12L15 3" />
        </svg>
      );
    case "asterisk":
      return (
        <svg {...SHARED}>
          <path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...SHARED}>
          <path d="M13 2 4 14h6.5L11 22l9-13h-6.5L13 2z" />
        </svg>
      );
    case "layers":
      return (
        <svg {...SHARED}>
          <path d="m12 3 8.5 4.9L12 12.8 3.5 7.9 12 3z" />
          <path d="m3.5 12 8.5 4.9 8.5-4.9" />
          <path d="m3.5 16.1 8.5 4.9 8.5-4.9" />
        </svg>
      );
    case "question":
      return (
        <svg {...SHARED}>
          <circle cx="12" cy="12" r="9.5" />
          <path d="M9.3 9.3a2.7 2.7 0 1 1 3.7 2.5c-.8.4-1 1-1 1.9" />
          <circle cx="12" cy="17" r="0.4" fill="currentColor" stroke="none" />
        </svg>
      );
    case "tag":
      return (
        <svg {...SHARED}>
          <path d="M20.5 12.3 12.7 20a1.5 1.5 0 0 1-2.1 0l-6.6-6.6a1.5 1.5 0 0 1 0-2.1L11.7 3.5H19a1.5 1.5 0 0 1 1.5 1.5v7.3z" />
          <circle cx="15.5" cy="8" r="1.2" />
        </svg>
      );
  }
}
