"use server";

import { checkoutSchema } from "@/lib/validation/checkout";
import { repriceCart, type RepriceInput } from "@/lib/repriceCart";
import { loadProductMap } from "@/lib/catalog";
import { nextOrderId } from "@/lib/counter";
import { createOrderDoc } from "@/lib/orders";
import type { CustomerInfo } from "@/types/order";

export type CreateOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

export async function createOrder(input: {
  customer: unknown;
  items: RepriceInput[];
}): Promise<CreateOrderResult> {
  // 1. Validate customer (authoritative — never trust the client).
  const parsed = checkoutSchema.safeParse(input.customer);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }

  // 2. Re-price items from the catalog server-side.
  const productMap = await loadProductMap();
  const priced = repriceCart(input.items ?? [], productMap);
  if (!priced.ok) {
    return { ok: false, error: priced.error };
  }

  // 3. Reserve an order id + persist.
  try {
    const orderId = await nextOrderId();
    const customer: CustomerInfo = {
      name: parsed.data.name,
      phone: parsed.data.phone,
      addressLine1: parsed.data.addressLine1,
      addressLine2: parsed.data.addressLine2 || undefined,
      city: parsed.data.city,
      state: parsed.data.state,
      pincode: parsed.data.pincode,
    };
    await createOrderDoc({
      orderId,
      customer,
      items: priced.items,
      totalAmount: priced.totalAmount,
    });
    return { ok: true, orderId };
  } catch (err) {
    console.error("createOrder failed:", err);
    return { ok: false, error: "Could not place your order. Please try again." };
  }
}
