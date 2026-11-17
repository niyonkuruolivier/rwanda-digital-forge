import type { OrderStatus } from "./data";

export const trackingSteps: { status: OrderStatus; label: string; note: string }[] = [
  { status: "Pending", label: "Ordered", note: "The shop has received your order." },
  { status: "Processing", label: "Preparing", note: "The shop is preparing your item." },
  { status: "Shipped", label: "On the way", note: "Your item is on its way to you." },
  { status: "Delivered", label: "Delivered", note: "Your item has been delivered." },
];

export const trackingStep = (status: OrderStatus) => Math.max(0, trackingSteps.findIndex((s) => s.status === status));
