import { cn } from "@/lib/cn";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function GlassCard({ children, className }: Props) {
  return (
    <div
      className={cn(
        "bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl shadow-petal-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
