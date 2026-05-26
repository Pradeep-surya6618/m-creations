const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number): string {
  // Intl uses a non-breaking space between symbol and number in some locales.
  // Normalize to a regular space-free "₹X" form for consistent UI rendering.
  return formatter.format(Math.round(amount)).replace(/\s/g, "");
}
