import { describe, it, expect } from "vitest";
import {
  canTransitionPayment,
  canAdvanceOrder,
  canRevertOrder,
  nextOrderStatus,
  prevOrderStatus,
} from "./orderTransitions";

describe("payment transitions", () => {
  it("Verification Pending → Paid is allowed", () => {
    expect(canTransitionPayment("Verification Pending", "Paid")).toBe(true);
  });
  it("Verification Pending → Rejected is allowed", () => {
    expect(canTransitionPayment("Verification Pending", "Rejected")).toBe(true);
  });
  it("Pending → Paid is NOT allowed (must upload first)", () => {
    expect(canTransitionPayment("Pending", "Paid")).toBe(false);
  });
  it("Paid → Rejected is NOT allowed", () => {
    expect(canTransitionPayment("Paid", "Rejected")).toBe(false);
  });
});

describe("order status workflow", () => {
  it("can advance Pending → Processing → Shipped → Delivered", () => {
    expect(canAdvanceOrder("Pending")).toBe(true);
    expect(nextOrderStatus("Pending")).toBe("Processing");
    expect(nextOrderStatus("Processing")).toBe("Shipped");
    expect(nextOrderStatus("Shipped")).toBe("Delivered");
  });
  it("cannot advance past Delivered", () => {
    expect(canAdvanceOrder("Delivered")).toBe(false);
    expect(nextOrderStatus("Delivered")).toBeNull();
  });
  it("can revert anywhere except Pending", () => {
    expect(canRevertOrder("Pending")).toBe(false);
    expect(prevOrderStatus("Pending")).toBeNull();
    expect(prevOrderStatus("Processing")).toBe("Pending");
    expect(prevOrderStatus("Shipped")).toBe("Processing");
    expect(prevOrderStatus("Delivered")).toBe("Shipped");
  });
});
