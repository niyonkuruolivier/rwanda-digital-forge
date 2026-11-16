import { expect, it } from "vitest";
import { SEED_PRODUCTS } from "./data";
import { homeProducts } from "./home-products";

it("puts new posts from any vendor at the top of Picked for you regardless of rating", () => {
  const sample = SEED_PRODUCTS[0];
  if (!sample) throw new Error("A sample product is required");
  const older = { ...sample, id: "p1794622643441", vendorId: "vendor-one", rating: 5 };
  const newest = { ...sample, id: "p1794624073627", vendorId: "vendor-two", rating: 0 };
  const products = [sample, older, newest];
  expect(homeProducts(products).map((product) => product.id)).toEqual(["p1794624073627", "p1794622643441", sample.id]);
  expect(products.map((product) => product.id)).toEqual([sample.id, older.id, newest.id]);
  expect(homeProducts([newest, { ...older, title: "Edited older product" }])[0]?.id).toBe(newest.id);
});