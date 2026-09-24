import { useId } from "react";

// Five Murano glass beads draped on a fine gold thread: the illustration for
// quiet moments such as an empty cart or wishlist. Decorative only.
const BEADS = [
  { x: 42, y: 34, r: 11, light: "#f6dca4", base: "#c98a2c", deep: "#7a4a12" },
  { x: 79, y: 52, r: 14, light: "#b9d0f2", base: "#2f5fa8", deep: "#15305f" },
  { x: 120, y: 60, r: 18, light: "#f6b3b0", base: "#b3202e", deep: "#5e0d16" },
  { x: 161, y: 52, r: 14, light: "#b8e3c6", base: "#2f7d52", deep: "#123d27" },
  { x: 198, y: 34, r: 11, light: "#f7d3dc", base: "#c9708a", deep: "#7a3348" },
];

export function BeadStrand({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 240 96"
      width="240"
      height="96"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {BEADS.map((bead, i) => (
          <radialGradient key={i} id={`${id}-${i}`} cx="36%" cy="32%" r="75%">
            <stop offset="0" stopColor={bead.light} />
            <stop offset="0.5" stopColor={bead.base} />
            <stop offset="1" stopColor={bead.deep} />
          </radialGradient>
        ))}
      </defs>
      <path d="M8 14 Q120 110 232 14" stroke="#b89a62" strokeWidth="0.9" strokeLinecap="round" />
      {BEADS.map((bead, i) => (
        <g key={i}>
          <ellipse
            cx={bead.x}
            cy={bead.y + bead.r + 5}
            rx={bead.r * 0.8}
            ry={bead.r * 0.14}
            fill="#123d43"
            opacity="0.07"
          />
          <circle
            cx={bead.x}
            cy={bead.y}
            r={bead.r}
            fill={`url(#${id}-${i})`}
            stroke="#d9cdbb"
            strokeWidth="0.8"
            opacity="0.95"
          />
          <ellipse
            cx={bead.x - bead.r * 0.34}
            cy={bead.y - bead.r * 0.4}
            rx={bead.r * 0.34}
            ry={bead.r * 0.18}
            transform={`rotate(-30 ${bead.x - bead.r * 0.34} ${bead.y - bead.r * 0.4})`}
            fill="#fff"
            opacity="0.7"
          />
          <circle
            cx={bead.x + bead.r * 0.35}
            cy={bead.y + bead.r * 0.45}
            r={bead.r * 0.16}
            fill="#fff"
            opacity="0.22"
          />
        </g>
      ))}
    </svg>
  );
}
