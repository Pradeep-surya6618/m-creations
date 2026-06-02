import { cn } from "@/lib/cn";

type Column<T> = {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  className?: string;
};

type Props<T> = {
  rows: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  rowKey: (row: T) => string;
  className?: string;
};

export function AdminTable<T>({
  rows, columns, emptyMessage = "Nothing here yet.", rowKey, className,
}: Props<T>) {
  if (rows.length === 0) {
    return (
      <div className={cn("py-12 text-center text-sm text-brand-ink-muted", className)}>
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className={cn("w-full", className)}>
      <table className="hidden md:table w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-[0.1em] text-brand-ink-muted">
          <tr className="border-b border-brand-blush">
            {columns.map((c) => (
              <th key={c.key} className={cn("py-3 px-3 font-semibold", c.className)}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)} className="border-b border-brand-blush/60 hover:bg-brand-cream">
              {columns.map((c) => (
                <td key={c.key} className={cn("py-3 px-3", c.className)}>
                  {c.render(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="md:hidden divide-y divide-brand-blush">
        {rows.map((r) => (
          <li key={rowKey(r)} className="py-4 space-y-2">
            {columns.map((c) => (
              <div key={c.key} className="flex justify-between gap-3 text-sm">
                <span className="text-[10px] uppercase tracking-[0.15em] text-brand-ink-muted font-bold">
                  {c.label}
                </span>
                <span className="text-right">{c.render(r)}</span>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
