import { describe, expect, it } from "vitest";
import { mergeCatalog } from "./catalog";
describe("shared seller updates", () => {
  it("uses the database creation time rather than seller-supplied store dates", () => {
    expect(mergeCatalog([], [{ kind: "store", id: "s", vendor_id: "s", record: { id: "s", createdAt: "2099-01-01" }, created_at: "2026-11-27T10:00:00Z", deleted: false }], "store")).toEqual([{ id: "s", createdAt: "2026-11-27T10:00:00Z" }]);
  });
  it("shows shared posts instead of stale browser copies", () => {
    expect(mergeCatalog([{ id: "p1", title: "Old" }], [{ kind: "product", id: "p1", vendor_id: "v", record: { id: "p1", title: "New" }, deleted: false }], "product")).toEqual([{ id: "p1", title: "New" }]);
  });
  it("keeps deleted products out of every visitor's seed catalog", () => {
    expect(mergeCatalog([{ id: "p1" }], [{ kind: "product", id: "p1", vendor_id: "v", record: { id: "p1" }, deleted: true }], "product")).toEqual([]);
  });
  it("removes an administrator-deleted story from shared buyer and vendor catalogs", () => {
    const rows = [{ kind: "story", id: "s1", vendor_id: "v", record: { id: "s1" }, deleted: true }];
    expect(mergeCatalog([{ id: "s1" }, { id: "s2" }], rows, "story")).toEqual([{ id: "s2" }]);
  });
});