import { describe, expect, it } from "vitest";
import { visibleAdminSections } from "./staff-tasks";
describe("helper sections", () => {
  it("admin sees everything", () => expect(visibleAdminSections(true, [])).toBeNull());
  it("helper sees only assigned tasks, never payments or withdrawals", () => {
    const s = visibleAdminSections(false, ["orders", "complaints"])!;
    expect([...s].sort()).toEqual(["buyers", "complaints", "orders"]);
    expect(s.has("payments")).toBe(false);
    expect(s.has("withdrawals")).toBe(false);
  });
});
