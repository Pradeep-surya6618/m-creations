import { cn } from "@/lib/cn";

type Variant = "category" | "count" | "new";

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
};

const variants: Record<Variant, string> = {
  category:
    "bg-white/85 backdrop-blur text-brand-ink-muted border border-brand-blush",
  count: "bg-brand-pink text-white",
  new: "bg-brand-pink text-white shadow-petal-sm",
};

export function Chip({ children, variant = "category", className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
