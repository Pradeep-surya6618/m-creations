"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { cn } from "@/lib/cn";

export type AdminSelectOption = { value: string; label: string };

type Props = {
  value: string;
  options: AdminSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Optional inline error message; widens to full-width and recolors the border. */
  error?: string;
  id?: string;
};

/**
 * Form-shaped premium select.
 *
 * Mirrors the look of <input>/<textarea> in the admin forms (rounded-xl,
 * brand-blush border, focus ring) but opens a brand-styled "paper" popup
 * with motion-driven entrance/exit and a check on the selected option.
 *
 * For pill-shaped storefront filters use the existing components/ui/Select.
 */
export function AdminSelect({
  value,
  options,
  onChange,
  placeholder = "Select…",
  disabled,
  className,
  error,
  id,
}: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);
  const reactId = useId();
  const menuId = `admin-select-${id ?? reactId}`;

  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
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
    <div className={cn("relative w-full", className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        aria-invalid={error ? true : undefined}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-sm font-medium cursor-pointer transition-all",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-pink/15",
          open
            ? "border-brand-pink ring-4 ring-brand-pink/15 shadow-petal-sm"
            : error
              ? "border-red-400"
              : "border-brand-blush hover:border-brand-pink/60",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className={current ? "text-brand-ink" : "text-brand-ink-muted"}>
          {current?.label ?? placeholder}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          aria-hidden
          className={cn(
            "text-brand-pink transition-transform duration-200 shrink-0",
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
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ originY: 0 }}
            className="absolute z-40 mt-2 w-full max-h-72 overflow-y-auto rounded-2xl bg-white border border-brand-blush shadow-petal-lg p-2"
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
                      "w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors flex items-center justify-between gap-3",
                      selected
                        ? "bg-brand-gradient text-white shadow-petal-sm"
                        : "text-brand-ink hover:bg-brand-blush/60"
                    )}
                  >
                    <span>{o.label}</span>
                    {selected && (
                      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
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
