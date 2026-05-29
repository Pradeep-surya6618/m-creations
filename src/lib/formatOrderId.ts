export function formatOrderId(seq: number): string {
  return `MC${1000 + seq}`;
}
