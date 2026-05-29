import { describe, it, expect } from "vitest";
import { repriceCart } from "./repriceCart";

describe("repriceCart", () => {
  it("rejects an empty cart", () => {
    const r = repriceCart([]);
    expect(r.ok).toBe(false);
  });
  it("prices a known in-stock product from the catalog", () => {
    const r = repriceCart([{ productId: "mc-p-001", quantity: 2 }]);
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
  it("rejects an unknown product id", () => {
    const r = repriceCart([{ productId: "nope", quantity: 1 }]);
    expect(r.ok).toBe(false);
  });
  it("rejects a sold-out product (mc-p-012 has stock 0)", () => {
    const r = repriceCart([{ productId: "mc-p-012", quantity: 1 }]);
    expect(r.ok).toBe(false);
  });
  it("rejects quantity < 1", () => {
    const r = repriceCart([{ productId: "mc-p-001", quantity: 0 }]);
    expect(r.ok).toBe(false);
  });
});
