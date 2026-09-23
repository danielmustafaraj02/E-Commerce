// Pure CSS partial-star fill (outline stars behind, clipped filled stars on
// top, width = rating/5) rather than five separate SVGs — cheaper to render
// and trivially supports fractional averages (4.3 stars) without picking
// between "round up" and "round down". `dir="ltr"` pins the fill direction
// regardless of page direction — a 4/5 rating reads left-to-right even on
// Arabic, matching how star ratings are shown nearly everywhere else.
export function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  const stars = "★★★★★";
  return (
    <span
      dir="ltr"
      className="relative inline-block leading-none whitespace-nowrap"
      style={{ fontSize: size }}
      aria-hidden="true"
    >
      <span className="text-foreground/20">{stars}</span>
      <span className="text-primary absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        {stars}
      </span>
    </span>
  );
}
