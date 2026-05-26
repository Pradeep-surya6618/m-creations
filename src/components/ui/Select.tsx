"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { cn } from "@/lib/cn";

export type SelectOption = {
  value: string;
  label: string;
};

type Props = {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  className?: string;
  triggerClassName?: string;
  /** Align the menu to the right edge of the trigger instead of the left. */
  alignEnd?: boolean;
};

export function Select({
  label,
  value,
  options,
  onChange,
  className,
  triggerClassName,
  alignEnd = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);
  const reactId = useId();
  const menuId = `select-menu-${reactId}`;

  const current = options.find((o) => o.value === value);
  const currentLabel = current?.label ?? "Select…";

  // Close on outside click + Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        triggerRef.current && triggerRef.current.contains(t)
      ) return;
      if (menuRef.current && menuRef.current.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleSelect = useCallback(
    (next: string) => {
      onChange(next);
      setOpen(false);
      triggerRef.current?.focus();
    },
    [onChange]
  );

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "group inline-flex items-center gap-3 rounded-full border bg-white px-4 py-2.5",
          "text-sm font-semibold text-brand-ink cursor-pointer transition-all",
          "shadow-petal-sm hover:shadow-petal-md",
          open
            ? "border-brand-pink"
            : "border-brand-blush hover:border-brand-pink/60",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream",
          triggerClassName
        )}
      >
        <span className="text-[10px] uppercase tracking-[0.18em] text-brand-ink-muted font-bold">
          {label}
        </span>
        <span className="text-brand-ink">{currentLabel}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          aria-hidden
          className={cn(
            "text-brand-pink transition-transform duration-200",
            open && "rotate-180"
          )}
        >
          <path
            d="M2 4l4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <m.ul
            ref={menuRef}
            id={menuId}
            role="listbox"
            aria-label={label}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ originY: 0 }}
            className={cn(
              "absolute z-40 mt-2 min-w-[14rem] max-h-72 overflow-y-auto",
              "rounded-2xl bg-white border border-brand-blush shadow-petal-md p-2",
              alignEnd ? "right-0" : "left-0"
            )}
          >
            {options.map((o) => {
              const selected = o.value === value;
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => handleSelect(o.value)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors",
                      "flex items-center justify-between gap-3",
                      selected
                        ? "bg-brand-pink text-white"
                        : "text-brand-ink hover:bg-brand-blush/60"
                    )}
                  >
                    <span>{o.label}</span>
                    {selected && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        aria-hidden
                      >
                        <path
                          d="M3 7.5l2.5 2.5L11 4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </m.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
