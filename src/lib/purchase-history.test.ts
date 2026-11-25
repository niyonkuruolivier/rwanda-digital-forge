import { describe, expect, it } from "vitest";
import type { Order, Vendor } from "./data";
import { purchaseOutcome, retainPurchaseShops, submitPurchaseComplaint } from "./purchase-history";
import { HOLD_MS, itemFunds, vendorBalance } from "./withdrawals";

const time = Date.parse("2026-11-14T00:00:00Z");
const item = { productId: "p", vendorId: "v", title: "Shirt", price: 10000, qty: 1, image: "", status: "Delivered" as const, options: { Size: "M" } };
const order: Order = { id: "o", buyerId: "buyer", date: "", customer: "Buyer", address: "", payment: "", total: 20000, paymentStatus: "Paid", paymentReference: "DEMO-o", paidAt: new Date(time).toISOString(), items: [item, { ...item, options: { Size: "L" } }] };
const photo = "data:image/jpeg;base64,eA==";

describe("purchase history", () => {
  it("retains purchased shop name, location and number after profile changes", () => {
    const vendor: Vendor = { id: "v", name: "Original shop", location: "Kigali", phone: "+250700000000", bio: "", logo: "", banner: "", joined: "", rating: 0 };
    const saved = retainPurchaseShops(order, [vendor]);
    expect(retainPurchaseShops(saved, [{ ...vendor, name: "Changed", phone: "" }]).items[0]?.shop).toEqual({ name: "Original shop", location: "Kigali", phone: "+250700000000" });
  });
  it("requires both a photo and written complaint before holding money", () => {
    expect(submitPurchaseComplaint(order, "p", { Size: "M" }, "buyer", "Broken", "", time + 1)).toBe(order);
    expect(submitPurchaseComplaint(order, "p", { Size: "M" }, "buyer", " ", photo, time + 1)).toBe(order);
  });
  it("holds only the complained variant and retains its evidence beyond two days", () => {
    const saved = submitPurchaseComplaint(order, "p", { Size: "M" }, "buyer", "Wrong size", photo, time + 1);
    const target = saved.items[0], sibling = saved.items[1];
    if (!target || !sibling) throw new Error("Missing purchases");
    expect(target.claim?.photo).toBe(photo);
    expect(target.claim?.message).toBe("Wrong size");
    expect(itemFunds(saved, target, time + HOLD_MS * 2)).toBe("disputed");
    expect(sibling.claim).toBeUndefined();
    expect(vendorBalance([saved], [], "v", time + HOLD_MS * 2)).toMatchObject({ disputed: 9000, available: 9000 });
  });
  it("does not reopen already released payments or another buyer's purchases", () => {
    expect(submitPurchaseComplaint(order, "p", { Size: "M" }, "other", "Broken", photo, time + 1)).toBe(order);
    expect(submitPurchaseComplaint(order, "p", { Size: "M" }, "buyer", "Broken", photo, time + HOLD_MS)).toBe(order);
  });
  it("distinguishes buyer approval from automatic release after two days", () => {
    expect(purchaseOutcome(order, item, time + HOLD_MS)).toContain("Automatically released after 2 days");
    expect(purchaseOutcome(order, { ...item, buyerConfirmedAt: new Date(time + 1).toISOString() }, time + 2)).toContain("You approved");
  });
});