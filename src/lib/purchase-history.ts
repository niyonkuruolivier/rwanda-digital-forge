import type { Order, OrderItem, Vendor } from "./data";
import { hasCompletedPayment } from "./orders";
import { itemFunds } from "./withdrawals";

export function retainPurchaseShops(order: Order, vendors: Vendor[]): Order {
  return { ...order, items: order.items.map((item) => {
    if (item.shop) return item;
    const vendor = vendors.find((v) => v.id === item.vendorId);
    return vendor ? { ...item, shop: { name: vendor.name, location: vendor.location, phone: vendor.phone } } : item;
  }) };
}

export function samePurchase(item: OrderItem, productId: string, options?: Record<string, string>): boolean {
  if (item.productId !== productId) return false;
  const a = item.options ?? {}, b = options ?? {};
  return Object.keys(a).length === Object.keys(b).length && Object.entries(a).every(([key, value]) => b[key] === value);
}

export function submitPurchaseComplaint(order: Order, productId: string, options: Record<string, string> | undefined, buyerId: string, message: string, photo: string, now = Date.now()): Order {
  if (order.buyerId !== buyerId || !hasCompletedPayment(order) || !message.trim() || !photo) return order;
  const target = order.items.find((item) => samePurchase(item, productId, options));
  if (!target || itemFunds(order, target, now) !== "pending") return order;
  return { ...order, items: order.items.map((item) => item === target ? { ...item, claim: { message: message.trim(), photo, createdAt: new Date(now).toISOString(), status: "open" } } : item) };
}

export function purchaseOutcome(order: Order, item: OrderItem, now = Date.now()): string {
  const state = itemFunds(order, item, now);
  if (state === "disputed") return "Complaint open · money held until admin decides";
  if (state === "refunded") return "Complaint resolved · marked refunded";
  if (item.claim?.status === "released") return "Complaint resolved · released to seller by admin";
  if (item.buyerConfirmedAt) return "You approved · released to seller";
  if (state === "available") return "Automatically released after 1 day · no approval received";
  return "Awaiting your approval · money held";
}