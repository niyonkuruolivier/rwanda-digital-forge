import { expect, it } from "vitest";
import { availableCartQuantity, vendorOrderCounts } from "./inventory";
import type { Order } from "./data";

it("prevents cart quantities exceeding combined stock across variations", () => {
  expect(availableCartQuantity(5, 5, 3)).toBe(2);
  expect(availableCartQuantity(0, 1)).toBe(0);
  expect(availableCartQuantity(5, -1)).toBe(0);
});
it("counts orders rather than item rows and only counts the seller's paid purchases", () => {
  const item = { productId: "p", vendorId: "v", title: "P", image: "", price: 100, qty: 1, status: "Delivered" as const };
  const paid: Order = { id: "o", customer: "Buyer", address: "Kigali", date: "", payment: "", total: 200, paymentStatus: "Paid", paidAt: "2026-11-18T00:00:00Z", paymentReference: "DEMO-test", items: [item, item] };
  expect(vendorOrderCounts([paid, { ...paid, paymentStatus: "Pending" }, { ...paid, items: [{ ...item, vendorId: "other" }] }], "v")).toEqual({ total: 1, pending: 0, completed: 1 });
});