import { expect, it } from "vitest";
import { SEED_PRODUCTS, type Order } from "./data";
import { homeProducts } from "./home-products";

const selected = SEED_PRODUCTS[0];
if (!selected) throw new Error("A sample product is required");
const sample = selected;
const older = { ...sample, id: "p1794622643441", vendorId: "vendor-one", rating: 1 };
const newest = { ...sample, id: "p1794624073627", vendorId: "vendor-two", rating: 5 };
function sale(productId: string, qty: number, paymentStatus: "Paid" | "Pending" = "Paid", refunded = false): Order {
  return { id: productId, date: "2026-11-16", customer: "Test", address: "", payment: "Demo", total: qty * sample.price, paymentStatus, paidAt: "2026-11-16T10:00:00Z", paymentReference: "DEMO-TEST", items: [{ productId, vendorId: sample.vendorId, title: sample.title, price: sample.price, qty, image: "", status: "Delivered", ...(refunded ? { claim: { status: "refunded" as const, createdAt: "2026-11-16T11:00:00Z", message: "Refunded" } } : {}) }] };
}
it("puts highest completed product sales first regardless of stars or posting date", () => {
  expect(homeProducts([newest, older], [sale(older.id, 3), sale(newest.id, 1)]).map(p => p.id)).toEqual([older.id, newest.id]);
});
it("adds sold quantities across completed purchases", () => {
  expect(homeProducts([newest, older], [sale(older.id, 2), sale(older.id, 2), sale(newest.id, 3)])[0]?.id).toBe(older.id);
});
it("does not count unpaid or refunded product sales", () => {
  expect(homeProducts([older, newest], [sale(older.id, 100, "Pending"), sale(older.id, 100, "Paid", true), sale(newest.id, 1)])[0]?.id).toBe(newest.id);
});
it("uses new posts only as a tie-breaker and preserves the input list", () => {
  const products = [sample, older, newest];
  expect(homeProducts(products, []).map((product) => product.id)).toEqual(["p1794624073627", "p1794622643441", sample.id]);
  expect(products.map((product) => product.id)).toEqual([sample.id, older.id, newest.id]);
  expect(homeProducts([newest, { ...older, title: "Edited older product" }], [])[0]?.id).toBe(newest.id);
});