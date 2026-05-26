"use client";

type Props = {
  value: number;
  onChange: (next: number) => void;
  max?: number;
  min?: number;
};

export function QuantityStepper({ value, onChange, max = 99, min = 1 }: Props) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <div className="inline-flex items-center rounded-full border border-brand-blush bg-white">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={dec}
        disabled={value <= min}
        className="w-9 h-9 flex items-center justify-center text-brand-pink cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-cream rounded-l-full"
      >
        −
      </button>
      <span
        aria-live="polite"
        className="min-w-[2.5rem] text-center text-sm font-semibold tabular-nums text-brand-ink"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={inc}
        disabled={value >= max}
        className="w-9 h-9 flex items-center justify-center text-brand-pink cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-cream rounded-r-full"
      >
        +
      </button>
    </div>
  );
}
