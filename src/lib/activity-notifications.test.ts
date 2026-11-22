import { expect, it } from "vitest";
import { activityDestination, unreadActivityCount } from "./activity-notifications";

it("counts a new activity without counting already-read activity", () => {
  const alerts = ["old", "new"].map(id => ({ id, title: "Order update", detail: "", href: "/orders", kind: "order", created_at: "2026-11-18" }));
  expect(unreadActivityCount(alerts, ["old"])).toBe(1);
  expect(unreadActivityCount(alerts, ["old", "new"])).toBe(0);
});
it("opens order, seller, and administrator activity destinations", () => {
  expect(activityDestination("/orders")).toBe("/orders");
  expect(activityDestination("/dashboard")).toBe("/dashboard");
  expect(activityDestination("/admin")).toBe("/admin");
  expect(activityDestination("/products/saved-product")).toBe("/products/saved-product");
});
it("rejects external and unsafe notification destinations", () => {
  expect(activityDestination("https://other.example/account")).toBe("/");
  expect(activityDestination("//other.example")).toBe("/");
  expect(activityDestination("javascript:alert(1)")).toBe("/");
});
import { activityDestination as dest } from "./activity-notifications";
import { it as it2, expect as expect2 } from "vitest";
it2("chat alerts open the conversation", () => {
  expect2(dest("/messages?t=0b5c1f0e-1111-4222-8333-444455556666")).toBe("/messages?t=0b5c1f0e-1111-4222-8333-444455556666");
  expect2(dest("/messages?t=evil")).toBe("/");
});
