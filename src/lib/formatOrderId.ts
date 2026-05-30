/**
 * Format a counter sequence as a human-friendly order ID.
 *
 * The +1000 offset is intentional: the first order issued has seq=1
 * (the counter's first $inc returns 1), and we want it to display as
 * "MC1001" so the IDs always read as 4-digit numbers from day one
 * (no MC1, MC2, MC10 awkwardness).
 *
 * Examples: formatOrderId(1) -> "MC1001", formatOrderId(24) -> "MC1024".
 */
export function formatOrderId(seq: number): string {
  return `MC${1000 + seq}`;
}
