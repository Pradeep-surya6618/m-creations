import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: never;
  };
type LinkProps = CommonProps & {
  href: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

const base =
  "inline-flex items-center justify-center rounded-full font-semibold cursor-pointer " +
  "transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "text-white bg-brand-gradient shadow-petal-sm hover:-translate-y-0.5 hover:shadow-petal-md",
  secondary:
    "text-brand-pink bg-white border border-brand-pink hover:bg-brand-pink hover:text-white",
  danger:
    "text-red-600 bg-white border border-red-300 hover:bg-red-50",
  ghost:
    "text-brand-ink-muted bg-transparent hover:bg-brand-blush",
};

const sizes: Record<Size, string> = {
  sm: "text-[11px] px-3 py-1.5 tracking-wide",
  md: "text-xs px-5 py-2.5 tracking-wide uppercase",
};

export function AdminButton(props: ButtonProps | LinkProps) {
  const { variant = "primary", size = "md", className, children } = props;
  const cls = cn(base, variants[variant], sizes[size], className);

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} onClick={props.onClick} className={cls}>
        {children}
      </Link>
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } =
    props as ButtonProps;
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
