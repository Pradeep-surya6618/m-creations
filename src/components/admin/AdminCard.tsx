import { cn } from "@/lib/cn";

type Props = {
  children: React.ReactNode;
  className?: string;
  title?: string;
};

export function AdminCard({ children, className, title }: Props) {
  return (
    <section
      className={cn(
        "bg-white rounded-2xl border border-brand-blush shadow-petal-sm",
        className
      )}
    >
      {title && (
        <header className="px-6 py-4 border-b border-brand-blush">
          <h2 className="text-xs uppercase tracking-[0.2em] text-brand-ink font-bold">
            {title}
          </h2>
        </header>
      )}
      <div className="p-6">{children}</div>
    </section>
  );
}
