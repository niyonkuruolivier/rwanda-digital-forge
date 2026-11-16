import { describe, expect, it } from "vitest";
import { mergeCatalog } from "./catalog";
describe("shared seller updates", () => {
  it("shows shared posts instead of stale browser copies", () => {
    expect(mergeCatalog([{ id: "p1", title: "Old" }], [{ kind: "product", id: "p1", vendor_id: "v", record: { id: "p1", title: "New" }, deleted: false }], "product")).toEqual([{ id: "p1", title: "New" }]);
  });
  it("keeps deleted products out of every visitor's seed catalog", () => {
    expect(mergeCatalog([{ id: "p1" }], [{ kind: "product", id: "p1", vendor_id: "v", record: { id: "p1" }, deleted: true }], "product")).toEqual([]);
  });
});