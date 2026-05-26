import { cn } from "@/lib/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  count?: number;
  children: React.ReactNode;
};

export function IconButton({ label, count, children, className, ...rest }: Props) {
  return (
    <button
      aria-label={count !== undefined ? `${label}, ${count} items` : label}
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-full cursor-pointer",
        "bg-white/70 backdrop-blur border border-brand-blush text-brand-pink",
        "transition-all hover:bg-white hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2",
        className
      )}
      {...rest}
    >
      {children}
      {count !== undefined && count > 0 && (
        <span
          aria-hidden
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-pink text-white text-[10px] font-bold flex items-center justify-center"
        >
          {count}
        </span>
      )}
    </button>
  );
}
