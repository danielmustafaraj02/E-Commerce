"use client";

import { useId, useState } from "react";

type Point = { date: string; revenue: number };

const WIDTH = 600;
const HEIGHT = 160;
const PAD_X = 8;
const PAD_TOP = 12;
const PAD_BOTTOM = 24;

export function SalesTrendChart({
  data,
  currency,
  locale,
}: {
  data: Point[];
  currency: string;
  locale: string;
}) {
  const gradientId = useId();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const max = Math.max(1, ...data.map((d) => d.revenue));
  const plotWidth = WIDTH - PAD_X * 2;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const points = data.map((d, i) => {
    const x = PAD_X + (data.length === 1 ? plotWidth / 2 : (i / (data.length - 1)) * plotWidth);
    const y = PAD_TOP + plotHeight - (d.revenue / max) * plotHeight;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1]?.x ?? 0},${PAD_TOP + plotHeight} L${points[0]?.x ?? 0},${PAD_TOP + plotHeight} Z`;

  const money = (cents: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(cents / 100);

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="text-primary w-full"
        role="img"
        aria-label="Daily revenue over the last 30 days"
        onMouseLeave={() => setHoverIndex(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          const index = Math.round(ratio * (points.length - 1));
          setHoverIndex(Math.min(points.length - 1, Math.max(0, index)));
        }}
      >
        {/* Recessive baseline — the only gridline, anchoring the fill. */}
        <line
          x1={PAD_X}
          y1={PAD_TOP + plotHeight}
          x2={WIDTH - PAD_X}
          y2={PAD_TOP + plotHeight}
          stroke="currentColor"
          strokeOpacity={0.12}
        />
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity={0.18} />
            <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {hovered && (
          <>
            <line
              x1={hovered.x}
              y1={PAD_TOP}
              x2={hovered.x}
              y2={PAD_TOP + plotHeight}
              stroke="currentColor"
              strokeOpacity={0.25}
            />
            <circle cx={hovered.x} cy={hovered.y} r={4} fill="currentColor" />
          </>
        )}
      </svg>
      {hovered && (
        <div
          className="border-foreground/10 bg-background pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-md border px-2.5 py-1.5 text-xs shadow-sm"
          style={{
            left: `${(hovered.x / WIDTH) * 100}%`,
            top: `${(hovered.y / HEIGHT) * 100}%`,
          }}
        >
          <p className="text-foreground/60">
            {new Date(hovered.date).toLocaleDateString(locale, { month: "short", day: "numeric" })}
          </p>
          <p className="font-medium">{money(hovered.revenue)}</p>
        </div>
      )}
    </div>
  );
}
