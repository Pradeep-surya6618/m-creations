import { describe, it, expect } from "vitest";
import { formatPrice } from "./formatPrice";

describe("formatPrice", () => {
  it("formats whole rupees with the rupee symbol", () => {
    expect(formatPrice(499)).toBe("₹499");
  });
  it("inserts the Indian thousands grouping (lakh/crore aware)", () => {
    expect(formatPrice(1299)).toBe("₹1,299");
    expect(formatPrice(125000)).toBe("₹1,25,000");
  });
  it("renders zero without decimals", () => {
    expect(formatPrice(0)).toBe("₹0");
  });
  it("rounds non-integer inputs to nearest whole rupee", () => {
    expect(formatPrice(499.4)).toBe("₹499");
    expect(formatPrice(499.6)).toBe("₹500");
  });
});
