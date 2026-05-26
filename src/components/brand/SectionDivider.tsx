import { cn } from "@/lib/cn";

type Props = { className?: string };

export function SectionDivider({ className }: Props) {
  return (
    <div
      role="presentation"
      className={cn(
        "flex items-center justify-center gap-4 py-4 text-brand-pink/60",
        className
      )}
    >
      <span className="h-px w-16 bg-brand-blush" />
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
        <g fill="currentColor">
          <circle cx="11" cy="11" r="2.2" />
          <ellipse cx="11" cy="5"  rx="2.4" ry="3.6" />
          <ellipse cx="11" cy="17" rx="2.4" ry="3.6" />
          <ellipse cx="5"  cy="11" rx="3.6" ry="2.4" />
          <ellipse cx="17" cy="11" rx="3.6" ry="2.4" />
        </g>
      </svg>
      <span className="h-px w-16 bg-brand-blush" />
    </div>
  );
}
