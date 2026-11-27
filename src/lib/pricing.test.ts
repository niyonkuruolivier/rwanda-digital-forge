import { describe, it, expect } from "vitest";
import { cartTotals, splitPayment } from "./pricing";
describe("pricing", () => {
  it("buyer pays the item subtotal with no extra fee", () => {
    expect(cartTotals([{ price: 100, qty: 2 }])).toEqual({ subtotal: 200, total: 200 });
  });
  it("platform keeps 10% and vendor receives 90%", () => {
    expect(splitPayment(50000)).toEqual({ commission: 6500, vendorShare: 43500 });
  });
});
