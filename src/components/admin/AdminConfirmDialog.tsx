"use client";

import { useEffect } from "react";
import { AnimatePresence, m } from "motion/react";
import { cn } from "@/lib/cn";

type Variant = "danger" | "info";

type Props = {
  open: boolean;
  onClose: () => void;
  /**
   * "danger" — destructive action (red confirm button shown).
   * "info"   — informational / blocked action (no confirm button needed unless
   *            onConfirm is provided; the dismiss button reads "Got it").
   */
  variant?: Variant;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Required for variant="danger". For "info" with no further action, omit. */
  onConfirm?: () => void;
  loading?: boolean;
  disableConfirm?: boolean;
};

/**
 * Brand-tinted modal confirm dialog: dark-pink panel (matching the storefront
 * footer) over a dimmed + blurred backdrop. Closes on Escape, backdrop click,
 * or the Cancel button. Backdrop click + Escape are disabled while a confirm
 * action is in flight to prevent half-submitted state.
 */
export function AdminConfirmDialog({
  open,
  onClose,
  variant = "danger",
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  loading,
  disableConfirm,
}: Props) {
  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape to dismiss (unless busy submitting).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, loading]);

  // Sensible default labels per variant.
  const cancelText = cancelLabel ?? (variant === "info" && !onConfirm ? "Got it" : "Cancel");
  const confirmText =
    confirmLabel ?? (variant === "danger" ? "Delete" : "Confirm");

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          {/* Backdrop — dims + blurs the page underneath so the dialog reads
              as the only interactive surface. */}
          <m.button
            type="button"
            aria-label="Close dialog"
            tabIndex={-1}
            onClick={() => {
              if (!loading) onClose();
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-brand-ink/55 backdrop-blur-sm cursor-default"
          />

          {/* Panel */}
          <m.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-petal-lg bg-brand-pink-dark text-white"
          >
            <div className="p-6 sm:p-7">
              {/* Variant icon */}
              <div
                className={cn(
                  "h-12 w-12 rounded-full inline-flex items-center justify-center mb-4",
                  variant === "danger"
                    ? "bg-red-500/20 text-red-100"
                    : "bg-white/15 text-white"
                )}
              >
                {variant === "danger" ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M3 6h18" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                )}
              </div>

              <h2 id="confirm-dialog-title" className="text-xl font-bold text-white leading-tight">
                {title}
              </h2>
              <div className="mt-2.5 text-sm text-white/80 leading-relaxed">
                {description}
              </div>

              <div className="mt-6 flex items-center gap-2 justify-end flex-wrap">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white/85 hover:text-white hover:bg-white/10 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelText}
                </button>
                {onConfirm && (
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading || disableConfirm}
                    className={cn(
                      "inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-all shadow-petal-sm",
                      variant === "danger"
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-white text-brand-pink-dark hover:bg-brand-blush",
                      "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-current"
                    )}
                  >
                    {loading ? "Working…" : confirmText}
                  </button>
                )}
              </div>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
