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
    // pa= must stay raw (real @) so GPay / PhonePe can resolve the
    // bank name via NPCI. Other params get URI-encoded as usual.
    expect(uri).toBe(
      "upi://pay?pa=maria@oksbi&pn=Maria%20Creations&am=499&tn=MC1024&cu=INR"
    );
  });
});
