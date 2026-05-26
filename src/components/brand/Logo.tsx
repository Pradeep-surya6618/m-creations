import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { LOGO_FILE, BRAND } from "@/lib/brand";

type Props = {
  variant?: "default" | "mark";
  className?: string;
  href?: string;
  priority?: boolean;
};

export function Logo({ variant = "default", className, href = "/", priority = false }: Props) {
  const isMark = variant === "mark";

  const inner = LOGO_FILE ? (
    <Image
      src={LOGO_FILE}
      alt={BRAND.name}
      width={isMark ? 40 : 160}
      height={isMark ? 40 : 48}
      priority={priority}
      className={cn(
        "h-auto w-auto object-contain",
        isMark ? "max-h-10" : "max-h-12"
      )}
    />
  ) : (
    <span
      className={cn(
        "font-script text-brand-pink leading-none",
        isMark ? "text-3xl" : "text-4xl"
      )}
    >
      {isMark ? "M" : BRAND.name}
    </span>
  );

  return (
    <Link
      href={href}
      aria-label={BRAND.name}
      className={cn("inline-flex items-center", className)}
    >
      {inner}
    </Link>
  );
}
