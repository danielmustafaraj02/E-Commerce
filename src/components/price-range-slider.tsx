"use client";

import { useState } from "react";
import * as Slider from "@radix-ui/react-slider";
import { formatMoney } from "@/lib/format";

export function PriceRangeSlider({
  min,
  max,
  defaultMin,
  defaultMax,
  currency,
  locale,
  separatorLabel,
  minLabel,
  maxLabel,
}: {
  min: number;
  max: number;
  defaultMin?: number;
  defaultMax?: number;
  currency: string;
  locale: string;
  separatorLabel: string;
  minLabel: string;
  maxLabel: string;
}) {
  // Bounds can legitimately collapse to a single price point (e.g. one
  // product, or a store with a uniform price) — pad so the track still has
  // a usable range instead of a zero-width slider.
  const hasRange = max > min;
  const sliderMin = hasRange ? min : Math.max(0, min - 1);
  const sliderMax = hasRange ? max : max + 1;
  const step = Math.max(1, Math.round((sliderMax - sliderMin) / 100));

  const [value, setValue] = useState<[number, number]>([
    Math.max(sliderMin, Math.min(defaultMin ?? sliderMin, sliderMax)),
    Math.min(sliderMax, Math.max(defaultMax ?? sliderMax, sliderMin)),
  ]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm font-medium">
        <span>{formatMoney(Math.round(value[0] * 100), currency, locale)}</span>
        <span className="text-foreground/40">{separatorLabel}</span>
        <span>{formatMoney(Math.round(value[1] * 100), currency, locale)}</span>
      </div>

      <Slider.Root
        className="relative flex h-5 w-full touch-none items-center select-none"
        min={sliderMin}
        max={sliderMax}
        step={step}
        minStepsBetweenThumbs={0}
        value={value}
        onValueChange={(next) => setValue([next[0], next[1]])}
      >
        <Slider.Track className="bg-foreground/10 relative h-1.5 w-full grow overflow-hidden rounded-full">
          <Slider.Range className="absolute h-full rounded-full bg-[linear-gradient(90deg,#e0a92e,#f5c451)]" />
        </Slider.Track>
        <Slider.Thumb
          aria-label={minLabel}
          className="block h-4.5 w-4.5 rounded-full border-2 border-[#f5c451] bg-background shadow transition-transform hover:scale-110 focus-visible:ring-4 focus-visible:ring-[#f5c451]/25 focus-visible:outline-none"
        />
        <Slider.Thumb
          aria-label={maxLabel}
          className="block h-4.5 w-4.5 rounded-full border-2 border-[#f5c451] bg-background shadow transition-transform hover:scale-110 focus-visible:ring-4 focus-visible:ring-[#f5c451]/25 focus-visible:outline-none"
        />
      </Slider.Root>

      <input type="hidden" name="minPrice" value={value[0]} />
      <input type="hidden" name="maxPrice" value={value[1]} />
    </div>
  );
}
