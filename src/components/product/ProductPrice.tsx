import { formatPrice } from "@/lib/formatPrice";
import { cn } from "@/lib/cn";

type Props = {
  amount: number;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-3xl",
};

export function ProductPrice({ amount, className, size = "md" }: Props) {
  return (
    <span
      className={cn(
        "font-bold text-brand-ink tabular-nums",
        sizes[size],
        className
      )}
    >
      {formatPrice(amount)}
    </span>
  );
}
