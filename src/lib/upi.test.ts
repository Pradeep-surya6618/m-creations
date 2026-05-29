import { describe, it, expect } from "vitest";
import { buildUpiUri } from "./upi";

describe("buildUpiUri", () => {
  it("builds a UPI deep link with encoded params", () => {
    const uri = buildUpiUri({
      payeeId: "maria@oksbi",
      payeeName: "Maria Creations",
      amount: 499,
      note: "MC1024",
    });
    expect(uri).toBe(
      "upi://pay?pa=maria%40oksbi&pn=Maria%20Creations&am=499&tn=MC1024&cu=INR"
    );
  });
});
