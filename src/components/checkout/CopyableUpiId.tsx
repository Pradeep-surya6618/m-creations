"use client";

import { useState } from "react";

export function CopyableUpiId({ upiId }: { upiId: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard may be unavailable; silently ignore
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-full border border-brand-blush bg-white px-4 py-2 text-sm font-semibold text-brand-ink-muted cursor-pointer hover:border-brand-pink transition-colors"
      aria-label={`Copy UPI ID ${upiId}`}
    >
      <span>{upiId}</span>
      <span className="text-brand-pink text-xs">{copied ? "Copied!" : "Copy"}</span>
    </button>
  );
}
