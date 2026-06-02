import { describe, it, expect } from "vitest";
import { repriceCart } from "./repriceCart";
import type { Product } from "@/types/product";

const catalog: Product[] = [
  {
    id: "mc-p-001",
    slug: "rose-garden-bouquet",
    name: "Rose Garden Bouquet",
    category: "bouquets",
    price: 499,
    images: ["/Handmade-1.jpeg"],
    shortDescription: "",
    handmadeDetails: [],
    stock: 8,
    featured: true,
    createdAt: "2026-04-02T10:00:00.000Z",
  },
  {
    id: "mc-p-012",
    slug: "blush-glow-candle",
    name: "Blush Glow Candle",
    category: "candle-floral",
    price: 849,
    images: ["/Handmade-1.jpeg"],
    shortDescription: "",
    handmadeDetails: [],
    stock: 0,
    createdAt: "2026-05-20T10:00:00.000Z",
  },
];
const map = new Map(catalog.map((p) => [p.id, p]));

describe("repriceCart", () => {
  it("rejects an empty cart", () => {
    expect(repriceCart([], map).ok).toBe(false);
  });
  it("prices a known in-stock product", () => {
    const r = repriceCart([{ productId: "mc-p-001", quantity: 2 }], map);
    expect(r).toEqual({
      ok: true,
      items: [
        {
          productId: "mc-p-001",
          name: "Rose Garden Bouquet",
          price: 499,
          quantity: 2,
          image: "/Handmade-1.jpeg",
        },
      ],
      totalAmount: 998,
    });
  });
  it("rejects unknown product", () => {
    expect(repriceCart([{ productId: "nope", quantity: 1 }], map).ok).toBe(false);
  });
  it("rejects sold-out", () => {
    expect(
      repriceCart([{ productId: "mc-p-012", quantity: 1 }], map).ok
    ).toBe(false);
  });
  it("rejects quantity < 1", () => {
    expect(
      repriceCart([{ productId: "mc-p-001", quantity: 0 }], map).ok
    ).toBe(false);
  });
  it("rejects quantity > stock", () => {
    expect(
      repriceCart([{ productId: "mc-p-001", quantity: 9 }], map).ok
    ).toBe(false);
  });
  it("rejects > 50 lines", () => {
    const lines = Array.from({ length: 51 }, () => ({
      productId: "mc-p-001",
      quantity: 1,
    }));
    expect(repriceCart(lines, map).ok).toBe(false);
  });
});
