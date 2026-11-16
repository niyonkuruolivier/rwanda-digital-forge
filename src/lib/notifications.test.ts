import { expect, it } from "vitest";
import { marketplaceNotifications, unreadNotificationCount } from "./notifications";
import { VENDORS } from "./data";
import type { Order } from "./data";
import { demoPaymentConfirmation } from "./orders";

it("marks read notifications without hiding new updates", () => {
  const updates = marketplaceNotifications([], [{ id: "deal", title: "Friday deals", vendorId: "kigali-tech", image: "photo", isLive: false, createdAt: 1 }], VENDORS);
  expect(unreadNotificationCount(updates, [])).toBe(1);
  expect(unreadNotificationCount(updates, updates.map((n) => n.id))).toBe(0);
});
it("adds an unread live update when a seller starts their live link", () => {
  const story = { id: "deal", title: "Friday deals", vendorId: "kigali-tech", image: "photo", isLive: false, createdAt: 1 };
  const before = marketplaceNotifications([], [story], VENDORS);
  const after = marketplaceNotifications([], [{ ...story, isLive: true, liveUrl: "https://www.tiktok.com/@seller/live", liveSince: Date.now() }], VENDORS);
  expect(after[0]?.kind).toBe("live");
  expect(unreadNotificationCount(after, before.map((n) => n.id))).toBe(1);
});

it("notifies the matching vendor only after payment completes", () => {
  const order: Order = { id: "test", date: "2026-11-13", customer: "Buyer", address: "Kigali", payment: "Mobile Money", total: 1000, items: [{ productId: "p1", vendorId: "kigali-tech", title: "Headphones", price: 1000, qty: 1, image: "", status: "Pending" }] };
  expect(marketplaceNotifications([order], [], VENDORS, "kigali-tech")).toEqual([]);
  const paid = { ...order, ...demoPaymentConfirmation("abc", "2026-11-13T23:26:00Z") };
  expect(marketplaceNotifications([paid], [], VENDORS, "kigali-tech")).toHaveLength(1);
  expect(marketplaceNotifications([paid], [], VENDORS, "urban-threads")).toEqual([]);
});