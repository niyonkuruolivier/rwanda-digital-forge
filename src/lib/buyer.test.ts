import { describe, expect, it } from "vitest";
import { buyerOrders, linkDemoBuyer } from "./buyer";
import type { Order } from "./data";

const order = (id: string, buyerId?: string, paymentStatus: Order["paymentStatus"] = "Paid"): Order => ({
  id, buyerId, paymentStatus, paymentReference: "DEMO-test", paidAt: "2026-11-14T00:00:00Z", paymentMode: "demo",
  date: "2026-11-14", customer: "Buyer", address: "Kigali", payment: "Mobile Money", items: [], total: 70000,
});

describe("client account purchases", () => {
  it("shows only this client's completed payments", () => {
    expect(buyerOrders([order("own", "demo-client"), order("other", "another-client"), order("unknown"), order("unpaid", "demo-client", "Pending")], "demo-client").map((o) => o.id)).toEqual(["own"]);
  });
  it("links the two client demo purchases without claiming another buyer's purchase", () => {
    expect(["MM-1004", "MM-1005", "MM-1001"].map((id) => linkDemoBuyer(order(id)).buyerId)).toEqual(["demo-client", "demo-client", undefined]);
    expect(linkDemoBuyer(order("MM-1004", "another-client")).buyerId).toBe("another-client");
  });
});