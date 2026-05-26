import { cn } from "@/lib/cn";

type Props = {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  ornament?: boolean;
  align?: "left" | "center";
  className?: string;
};

const sizes: Record<NonNullable<Props["as"]>, string> = {
  h1: "text-5xl sm:text-6xl lg:text-7xl",
  h2: "text-4xl sm:text-5xl",
  h3: "text-3xl sm:text-4xl",
};

export function ScriptHeading({
  children,
  as = "h2",
  ornament = false,
  align = "left",
  className,
}: Props) {
  const Tag = as;
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      <Tag
        className={cn(
          "font-script text-brand-pink leading-[1] tracking-tight",
          sizes[as]
        )}
      >
        {children}
      </Tag>
      {ornament && (
        <div
          aria-hidden
          className={cn(
            "mt-4 text-brand-pink/60 tracking-[0.8em]",
            align === "center" ? "text-center" : "text-left"
          )}
        >
          ✿ ✿ ✿
        </div>
      )}
    </div>
  );
}
