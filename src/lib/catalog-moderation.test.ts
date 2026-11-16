import { expect, it } from "vitest";
import { categoryPictureSchema, removePostSchema, requireCatalogAdministrator } from "./catalog-moderation";
import { sharedCatalog } from "./catalog";

it("only allows verified administrators to moderate posts or edit category pictures", () => {
  expect(() => requireCatalogAdministrator(false)).toThrow("Administrator access required");
  expect(() => requireCatalogAdministrator(true, new Error("Role lookup failed"))).toThrow();
  expect(() => requireCatalogAdministrator(true)).not.toThrow();
});
it("only deletes products and stories, not profiles or retained agreements", () => {
  expect(removePostSchema.safeParse({ kind: "product", id: "p1" }).success).toBe(true);
  expect(removePostSchema.safeParse({ kind: "story", id: "story1" }).success).toBe(true);
  for (const kind of ["store", "agreement", "order"]) expect(removePostSchema.safeParse({ kind, id: "1" }).success).toBe(false);
});
it("category pictures require manual compressed photos smaller than 30000 bytes", () => {
  expect(categoryPictureSchema.safeParse({ name: "Fashion", image: "data:image/webp;base64,AAAA" }).success).toBe(true);
  expect(categoryPictureSchema.safeParse({ name: "Fashion", image: "https://example.com/image.jpg" }).success).toBe(false);
  expect(categoryPictureSchema.safeParse({ name: "Fashion", image: "data:image/webp;base64," + "AAAA".repeat(10000) }).success).toBe(false);
});
it("removed posts disappear from both product and story feeds without affecting stores", () => {
  const seed = { products: [{ id: "p1" }], stories: [{ id: "s1" }], vendors: [{ id: "v1" }] };
  const rows = ["product", "story"].map((kind) => ({ kind, id: kind === "product" ? "p1" : "s1", vendor_id: "v1", record: {}, deleted: true }));
  expect(sharedCatalog(rows, seed as Parameters<typeof sharedCatalog>[1])).toEqual({ products: [], stories: [], vendors: [{ id: "v1" }] });
});