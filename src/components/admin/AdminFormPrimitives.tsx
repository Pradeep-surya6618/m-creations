import { cn } from "@/lib/cn";

/**
 * Shared aesthetic for admin form inputs / textareas (rounded-xl, soft
 * blush border, 4px brand-pink focus ring). Compose with `fieldNormal`
 * or `fieldError` for the border colour.
 */
export const fieldBase =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm text-brand-ink placeholder:text-brand-ink-muted/60 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-pink/15 disabled:opacity-60 disabled:cursor-not-allowed";

export const fieldNormal = "border-brand-blush focus-visible:border-brand-pink";
export const fieldError =
  "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-200/60";

export function fieldClasses(hasError?: unknown) {
  return cn(fieldBase, hasError ? fieldError : fieldNormal);
}

/* ────────────────────────────────────────────────────────────────────── */

export function FormSection({
  title,
  subtitle,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl bg-white border border-brand-blush shadow-petal-sm p-6 sm:p-7",
        className
      )}
    >
      <header className="mb-5">
        <h2 className="text-base font-bold text-brand-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-brand-ink-muted">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

/**
 * One labelled field row. `rightSlot` is where you put live counters,
 * "Preview" toggles, "(permanent)" hints, etc. — anything that sits on
 * the same baseline as the label.
 */
export function Field({
  label,
  hint,
  error,
  rightSlot,
  htmlFor,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  rightSlot?: React.ReactNode;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const Wrapper = htmlFor ? "div" : "label";
  return (
    <Wrapper className={cn("block", className)}>
      <div className="flex items-baseline justify-between mb-2 gap-3">
        <label
          htmlFor={htmlFor}
          className="text-[10px] uppercase tracking-[0.18em] text-brand-ink-muted font-bold"
        >
          {label}
        </label>
        {rightSlot}
      </div>
      {children}
      {error ? (
        <span className="block mt-1.5 text-[11px] font-semibold text-red-600">{error}</span>
      ) : hint ? (
        <span className="block mt-1.5 text-[11px] text-brand-ink-muted">{hint}</span>
      ) : null}
    </Wrapper>
  );
}

/**
 * Live char count "42 / 200" that turns brand-pink-dark at 85% capacity
 * and red when over. Drop into a Field's `rightSlot`.
 */
export function CharCount({ value, max }: { value: number; max: number }) {
  const near = value >= max * 0.85;
  const over = value > max;
  return (
    <span
      className={cn(
        "text-[10px] font-bold tabular-nums tracking-wide transition-colors",
        over ? "text-red-600" : near ? "text-brand-pink-dark" : "text-brand-ink-muted"
      )}
    >
      {value} / {max}
    </span>
  );
}
