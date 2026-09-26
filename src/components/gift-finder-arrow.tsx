// A plain chevron for the Gift Finder entry CTAs (homepage band, product page
// link) — kept as its own tiny component since it's used in two otherwise
// unrelated places. Mirrored for Arabic (the only RTL locale) via the
// .shelf[dir="rtl"] rule in home.css instead of translating an arrow glyph.
export function GiftFinderArrow() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="giftfinder-arrow"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}
