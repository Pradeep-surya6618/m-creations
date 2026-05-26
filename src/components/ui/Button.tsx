import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "gradient" | "ghost" | "outline" | "link";
type Size = "sm" | "md" | "lg";

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
  target?: string;
  rel?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

const base =
  "inline-flex items-center justify-center rounded-full font-semibold tracking-wide uppercase " +
  "transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-brand-pink focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  gradient:
    "text-white bg-brand-gradient shadow-petal-md hover:-translate-y-0.5 hover:shadow-petal-lg",
  ghost:
    "text-brand-pink bg-white/70 backdrop-blur border border-brand-blush hover:bg-white hover:-translate-y-0.5",
  outline:
    "text-brand-pink border border-brand-pink hover:bg-brand-pink hover:text-white",
  link: "text-brand-pink underline-offset-4 hover:underline px-0 rounded-none",
};

const sizes: Record<Size, string> = {
  sm: "text-[11px] px-4 py-2",
  md: "text-xs px-6 py-3",
  lg: "text-sm px-8 py-3.5",
};

export function Button(props: ButtonProps | LinkProps) {
  const { variant = "gradient", size = "md", className, children } = props;
  const cls = cn(base, variants[variant], sizes[size], className);

  if ("href" in props && props.href) {
    return (
      <Link
        href={props.href}
        target={props.target}
        rel={props.rel}
        onClick={props.onClick}
        className={cls}
      >
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
