import { describe, it, expect, beforeEach } from "vitest";
import { useWishlistStore } from "./wishlist";

const reset = () => useWishlistStore.setState(useWishlistStore.getInitialState(), true);

describe("wishlist store", () => {
  beforeEach(reset);

  it("starts empty", () => {
    expect(useWishlistStore.getState().ids).toEqual([]);
    expect(useWishlistStore.getState().has("x")).toBe(false);
  });
  it("toggle adds when missing, removes when present", () => {
    const { toggle, has } = useWishlistStore.getState();
    toggle("mc-p-001");
    expect(has("mc-p-001")).toBe(true);
    toggle("mc-p-001");
    expect(has("mc-p-001")).toBe(false);
  });
  it("ids remain unique even if toggled twice quickly", () => {
    useWishlistStore.getState().toggle("a");
    useWishlistStore.getState().toggle("b");
    useWishlistStore.getState().toggle("a");
    useWishlistStore.getState().toggle("a");
    expect(useWishlistStore.getState().ids.sort()).toEqual(["a", "b"]);
  });
  it("clear empties the wishlist", () => {
    const { toggle, clear } = useWishlistStore.getState();
    toggle("a");
    toggle("b");
    clear();
    expect(useWishlistStore.getState().ids).toEqual([]);
  });
});
