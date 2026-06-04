import Link from "next/link";

/**
 * Top-of-page back-link for admin sub-pages (product edit, category create,
 * content editors, etc.). Renders as a small icon + label pill so it's
 * obvious without dominating the page header.
 */
export function AdminBackLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-brand-ink-muted hover:text-brand-pink transition-colors cursor-pointer group"
    >
      <span className="h-7 w-7 inline-flex items-center justify-center rounded-full border border-brand-blush bg-white text-brand-pink shadow-petal-sm group-hover:-translate-x-0.5 transition-transform">
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M9 12L4 7l5-5" />
        </svg>
      </span>
      <span>{label}</span>
    </Link>
  );
}
