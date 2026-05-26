import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "./cart";

const reset = () => useCartStore.setState(useCartStore.getInitialState(), true);

describe("cart store", () => {
  beforeEach(reset);

  it("starts empty", () => {
    expect(useCartStore.getState().items).toEqual([]);
  });
  it("adds a new item with default quantity 1", () => {
    useCartStore.getState().add("mc-p-001");
    expect(useCartStore.getState().items).toEqual([{ productId: "mc-p-001", quantity: 1 }]);
  });
  it("increments quantity when adding the same id again", () => {
    const { add } = useCartStore.getState();
    add("mc-p-001");
    add("mc-p-001", 2);
    expect(useCartStore.getState().items).toEqual([{ productId: "mc-p-001", quantity: 3 }]);
  });
  it("setQty replaces the quantity (clamped to >= 1)", () => {
    const { add, setQty } = useCartStore.getState();
    add("mc-p-001");
    setQty("mc-p-001", 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
    setQty("mc-p-001", 0);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });
  it("remove drops the item", () => {
    const { add, remove } = useCartStore.getState();
    add("mc-p-001");
    add("mc-p-002");
    remove("mc-p-001");
    expect(useCartStore.getState().items).toEqual([{ productId: "mc-p-002", quantity: 1 }]);
  });
  it("clear empties the cart", () => {
    const { add, clear } = useCartStore.getState();
    add("mc-p-001");
    add("mc-p-002");
    clear();
    expect(useCartStore.getState().items).toEqual([]);
  });
});
