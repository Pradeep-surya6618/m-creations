import { cn } from "@/lib/cn";

type Props = {
  children: React.ReactNode;
  className?: string;
  width?: "page" | "hero";
};

export function Container({ children, className, width = "page" }: Props) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 sm:px-8",
        width === "page" ? "max-w-[1280px]" : "max-w-[1440px]",
        className
      )}
    >
      {children}
    </div>
  );
}
