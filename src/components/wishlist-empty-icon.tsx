import type { CSSProperties } from "react";

// A little charm bracelet — colored "gem" beads around a dashed band — used
// by both wishlist pages' empty states (signed-in and guest). Swings gently
// and forever (.animate-bracelet-sway); each bead pops in once on mount,
// staggered via --bead-delay (.bracelet-bead), for a small sparkle moment.
const BEADS: { cx: number; cy: number; className: string; delay: number }[] = [
  { cx: 12, cy: 4, className: "fill-primary", delay: 0 },
  { cx: 18.9, cy: 8, className: "fill-secondary", delay: 0.08 },
  { cx: 18.9, cy: 16, className: "fill-[#f5c451]", delay: 0.16 },
  { cx: 12, cy: 20, className: "fill-danger", delay: 0.24 },
  { cx: 5.1, cy: 16, className: "fill-success", delay: 0.32 },
  { cx: 5.1, cy: 8, className: "fill-secondary", delay: 0.4 },
];

export function WishlistEmptyIcon() {
  return (
    <svg
      width="112"
      height="112"
      viewBox="0 0 24 24"
      fill="none"
      className="animate-bracelet-sway"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="8"
        className="stroke-foreground/20"
        strokeWidth="1.5"
        strokeDasharray="2.2 3.4"
      />
      {BEADS.map((bead, i) => (
        <circle
          key={i}
          cx={bead.cx}
          cy={bead.cy}
          r="1.7"
          className={`${bead.className} bracelet-bead`}
          style={{ "--bead-delay": `${bead.delay}s` } as CSSProperties}
        />
      ))}
    </svg>
  );
}
