import type { Order } from "./data";

// Demo confirmation is not proof of a real payment or a withdrawal credential.
export function hasCompletedPayment(order: Order): boolean {
  return order.paymentStatus === "Paid" && Boolean(order.paidAt) && Boolean(order.paymentReference);
}

export function paidVendorLines(orders: Order[], vendorId: string) {
  return orders.filter(hasCompletedPayment).flatMap((order) =>
    order.items.filter((item) => item.vendorId === vendorId).map((item) => ({ order, item })),
  );
}

export function demoPaymentConfirmation(reference: string, paidAt: string) {
  return { paymentStatus: "Paid" as const, paymentReference: `DEMO-${reference}`, paidAt, paymentMode: "demo" as const };
}