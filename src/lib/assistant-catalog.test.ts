import { describe, expect, it } from "vitest";
import { SEED_PRODUCTS, VENDORS } from "./data";
import { searchAssistantProducts } from "./assistant-catalog";

describe("assistant product search", () => {
  it("only lists products that are in stock", () => {
    const found = searchAssistantProducts(SEED_PRODUCTS, VENDORS, "bluetooth speaker");
    expect(found.some((p) => p.id === "p3")).toBe(false);
  });
  it("finds matching in-stock products", () => {
    expect(searchAssistantProducts(SEED_PRODUCTS, VENDORS, "headphones")[0]?.id).toBe("p1");
  });
});
