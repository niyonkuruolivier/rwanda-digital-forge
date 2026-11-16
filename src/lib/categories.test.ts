import { describe, expect, it } from "vitest";
import { requireProductCategory } from "./categories";
const categories = ["Fashion", "Electronics", "Home Decor", "Art", "Services", "Furniture"];
describe("required product categorization", () => {
  it("rejects a product with no category", () => { expect(() => requireProductCategory("", categories)).toThrow(); });
  it("rejects multiple categories for one product", () => { expect(() => requireProductCategory(["Fashion", "Furniture"], categories)).toThrow(); });
  it("accepts an administrator-added Furniture category", () => { expect(requireProductCategory("Furniture", categories)).toBe("Furniture"); });
  it("rejects a category the administrator has not added", () => { expect(() => requireProductCategory("Unknown", categories)).toThrow(); });
});