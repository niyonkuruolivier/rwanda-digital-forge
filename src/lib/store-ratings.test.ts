import { expect, it } from "vitest";
import { VENDORS, type Order } from "./data";
import { ratedVendors, rankStores, storeRatingInput } from "./store-ratings";
const vendors = ratedVendors(VENDORS.slice(0, 2), []);
const first = vendors[0]; const second = vendors[1];
if (!first || !second) throw new Error("Two sample stores required");
const a = first; const b = second;
function order(vendorId: string, qty: number, paidAt = "2026-11-10T00:00:00Z", paid = true): Order { return { id: vendorId, date: paidAt, paidAt, paymentReference: "DEMO-TEST", paymentStatus: paid ? "Paid" : "Pending", customer: "Test", address: "", payment: "Demo", total: 100, items: [{ vendorId, productId: "test", title: "Test", image: "", price: 100, qty, status: "Delivered" }] }; }
it("never assigns automatic stars from illustrative store scores", () => expect(vendors.map(v => [v.rating, v.ratingCount])).toEqual([[0,0],[0,0]]));
it("accepts only deliberately selected whole stars from one to five", () => { for (const stars of [1,2,3,4,5]) expect(storeRatingInput.safeParse({ vendorId: a.id, stars }).success).toBe(true); for (const stars of [0,6,2.5]) expect(storeRatingInput.safeParse({ vendorId: a.id, stars }).success).toBe(false); });
it("prioritizes higher completed sales over visitor ratings", () => expect(rankStores([{ ...a, rating: 5, ratingCount: 1 }, { ...b, rating: 4, ratingCount: 50 }], [order(b.id, 100)])[0]?.id).toBe(b.id));
it("uses number of ratings when averages tie", () => expect(rankStores([{ ...a, rating: 5, ratingCount: 1 }, { ...b, rating: 5, ratingCount: 2 }], [])[0]?.id).toBe(b.id));
it("ranks completed sales first and excludes unpaid sales", () => expect(rankStores(vendors, [order(a.id, 100, undefined, false), order(b.id, 2)])[0]?.id).toBe(b.id));
it("ranks recent sales next when total units tie", () => expect(rankStores(vendors, [order(a.id, 2, "2026-09-01T00:00:00Z"), order(b.id, 2)], Date.parse("2026-11-16T00:00:00Z"))[0]?.id).toBe(b.id));
it("puts the newest shop first and orders remaining shops by sales", () => {
  const newShop = { ...a, id: "new", createdAt: "2026-11-15T00:00:00Z" };
  const oldShop = { ...a, createdAt: "2026-10-01T00:00:00Z" };
  expect(rankStores([oldShop, newShop, b], [order(b.id, 20), order(a.id, 2)], Date.parse("2026-11-16T00:00:00Z")).map(v => v.id)).toEqual(["new", b.id, a.id]);
});