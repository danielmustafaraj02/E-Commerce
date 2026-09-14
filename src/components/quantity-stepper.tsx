"use client";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  decreaseLabel = "Decrease quantity",
  increaseLabel = "Increase quantity",
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  decreaseLabel?: string;
  increaseLabel?: string;
}) {
  return (
    <div className="border-foreground/15 inline-flex h-9 shrink-0 items-center rounded-md border">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={decreaseLabel}
        className="text-foreground/70 hover:text-primary flex h-full w-8 items-center justify-center text-base transition-colors disabled:pointer-events-none disabled:opacity-30"
      >
        &minus;
      </button>
      <span className="w-7 text-center text-sm font-medium tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label={increaseLabel}
        className="text-foreground/70 hover:text-primary flex h-full w-8 items-center justify-center text-base transition-colors"
      >
        +
      </button>
    </div>
  );
}
