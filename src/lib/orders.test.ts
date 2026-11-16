import { expect, it } from "vitest";
import type { Order } from "./data";
import { demoPaymentConfirmation, paidVendorLines } from "./orders";

const order: Order = {
  id: "MM-test", date: "2026-11-13", customer: "Buyer", address: "Kigali", payment: "Mobile Money", total: 3150,
  items: [
    { productId: "a", vendorId: "seller-a", title: "A", price: 1000, qty: 1, image: "", status: "Pending" },
    { productId: "b", vendorId: "seller-b", title: "B", price: 2000, qty: 1, image: "", status: "Pending" },
  ],
};

it("does not show an order or payment code before payment completes", () => {
  expect(paidVendorLines([order, { ...order, paymentStatus: "Pending" }, { ...order, paymentStatus: "Failed" }], "seller-a")).toEqual([]);
});

it("requires a confirmation reference and completion time even when marked paid", () => {
  expect(paidVendorLines([{ ...order, paymentStatus: "Paid" }, { ...order, paymentStatus: "Paid", paidAt: "2026-11-13T23:26:00Z" }], "seller-a")).toEqual([]);
});

it("shows the demo payment reference after payment finishes", () => {
  const paid = { ...order, ...demoPaymentConfirmation("abc", "2026-11-13T23:26:00Z") };
  expect(paidVendorLines([paid], "seller-a")[0]?.order.paymentReference).toBe("DEMO-abc");
  expect(paidVendorLines([paid], "seller-a")[0]?.order.paidAt).toBe("2026-11-13T23:26:00Z");
});

it("shows a vendor only their own purchased items and amounts", () => {
  const paid = { ...order, ...demoPaymentConfirmation("abc", "2026-11-13T23:26:00Z") };
  const lines = paidVendorLines([paid], "seller-a");
  expect(lines.map(({ item }) => item.productId)).toEqual(["a"]);
  expect(lines.reduce((total, { item }) => total + item.price * item.qty, 0)).toBe(1000);
  expect(paidVendorLines([paid], "seller-c")).toEqual([]);
});