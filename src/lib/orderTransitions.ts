import type { OrderStatus, PaymentStatus } from "@/types/order";

const ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
];

const PAYMENT_ALLOWED: Record<PaymentStatus, PaymentStatus[]> = {
  Pending: [],
  "Verification Pending": ["Paid", "Rejected"],
  Paid: [],
  Rejected: ["Paid"], // admin may correct a mistaken rejection
};

export function canTransitionPayment(
  from: PaymentStatus,
  to: PaymentStatus
): boolean {
  return PAYMENT_ALLOWED[from]?.includes(to) ?? false;
}

export function canAdvanceOrder(from: OrderStatus): boolean {
  return ORDER_STATUSES.indexOf(from) < ORDER_STATUSES.length - 1;
}
export function canRevertOrder(from: OrderStatus): boolean {
  return ORDER_STATUSES.indexOf(from) > 0;
}
export function nextOrderStatus(from: OrderStatus): OrderStatus | null {
  const idx = ORDER_STATUSES.indexOf(from);
  return idx < 0 || idx === ORDER_STATUSES.length - 1
    ? null
    : ORDER_STATUSES[idx + 1];
}
export function prevOrderStatus(from: OrderStatus): OrderStatus | null {
  const idx = ORDER_STATUSES.indexOf(from);
  return idx <= 0 ? null : ORDER_STATUSES[idx - 1];
}
