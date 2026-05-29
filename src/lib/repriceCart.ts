import { products } from "@/data/products";
import type { OrderItem } from "@/types/order";

export type RepriceInput = { productId: string; quantity: number };

export type RepriceResult =
  | { ok: true; items: OrderItem[]; totalAmount: number }
  | { ok: false; error: string };

export function repriceCart(input: RepriceInput[]): RepriceResult {
  if (input.length === 0) return { ok: false, error: "Your cart is empty." };

  const items: OrderItem[] = [];
  for (const line of input) {
    const product = products.find((p) => p.id === line.productId);
    if (!product) return { ok: false, error: `Unknown product: ${line.productId}` };
    if (!Number.isInteger(line.quantity) || line.quantity < 1) {
      return { ok: false, error: `Invalid quantity for ${product.name}.` };
    }
    if (product.stock <= 0) {
      return { ok: false, error: `${product.name} is sold out.` };
    }
    items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: line.quantity,
      image: product.images[0] ?? "/Handmade-1.jpeg",
    });
  }
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return { ok: true, items, totalAmount };
}
