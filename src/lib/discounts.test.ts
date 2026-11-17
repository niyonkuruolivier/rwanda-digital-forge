import { expect, it } from "vitest";
import { SEED_PRODUCTS } from "./data";
import { applyDiscount, discountPercent, isDiscounted } from "./discounts";

const product = { ...SEED_PRODUCTS[0], id: "discount-test", vendorId: "seller", title: "Test", category: "Electronics", price: 100000, compareAt: undefined, stock: 2, images: ["photo"], description: "Test", rating: 0, reviews: [] };
it("puts an existing product into discounts at the reduced price, preserving its details", () => {
  const discounted = applyDiscount(product, 20);
  expect(discounted).toEqual({ ...product, price: 80000, compareAt: 100000 });
  expect(isDiscounted(discounted)).toBe(true);
  expect(discountPercent(discounted)).toBe(20);
});
it("changes discounts from the original price rather than stacking them", () => {
  expect(applyDiscount(applyDiscount(product, 20), 50).price).toBe(50000);
});
it("removes a discount and restores the original price", () => {
  const restored = applyDiscount(applyDiscount(product, 20), 0);
  expect(restored.price).toBe(100000);
  expect(isDiscounted(restored)).toBe(false);
});
it("excludes normal prices and invalid comparison prices from discounted products", () => {
  expect([product, { ...product, compareAt: 100000 }, { ...product, compareAt: 90000 }, applyDiscount(product, 20)].filter(isDiscounted).map(p => p.price)).toEqual([80000]);
});
it("retains the existing whole percentage limit of 0–90", () => {
  for (const percentage of [-1, 91, 2.5, NaN]) expect(() => applyDiscount(product, percentage)).toThrow();
  expect(applyDiscount(product, 90).price).toBe(10000);
});