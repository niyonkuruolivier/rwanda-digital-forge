import { describe, expect, it } from "vitest";
import { trackingStep, trackingSteps } from "./order-tracking";

describe("order tracking", () => {
  it("orders the four stages from ordered to delivered", () => {
    expect(trackingSteps.map((s) => s.label)).toEqual(["Ordered", "Preparing", "On the way", "Delivered"]);
  });
  it("maps shipped items to the on-the-way stage", () => {
    expect(trackingStep("Shipped")).toBe(2);
    expect(trackingStep("Pending")).toBe(0);
  });
});
