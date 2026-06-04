import type { SVGProps } from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "stroke"> & { size?: number };

// Single base spec keeps every icon visually consistent (stroke width,
// linecaps, currentColor). Each icon = just the path/shape children.
function Icon({
  size = 20,
  className,
  children,
  ...rest
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      {...rest}
    >
      {children}
    </svg>
  );
}

export function DashboardIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.75" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.75" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.75" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.75" />
    </Icon>
  );
}

export function OrdersIcon(props: IconProps) {
  // Package — three planes give it depth
  return (
    <Icon {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.3 7 12 12 20.7 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
      <line x1="7.5" y1="4.5" x2="16.5" y2="9.5" />
    </Icon>
  );
}

export function ProductsIcon(props: IconProps) {
  // Four-petal flower with filled center — on-brand for the boutique
  return (
    <Icon {...props}>
      <circle cx="12" cy="7.5" r="3.25" />
      <circle cx="7.5" cy="12" r="3.25" />
      <circle cx="16.5" cy="12" r="3.25" />
      <circle cx="12" cy="16.5" r="3.25" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function CategoriesIcon(props: IconProps) {
  // Tag with punched hole
  return (
    <Icon {...props}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <circle cx="7" cy="7" r="1.25" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function ContentIcon(props: IconProps) {
  // Document with text lines
  return (
    <Icon {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </Icon>
  );
}
