import { expect, it } from "vitest";
import { deliveryUpdateSchema } from "./delivery";
const data = { id: "11111111-1111-4111-8111-111111111111", status: "Shipped", delivery: { driverName: "Test courier", phone: "0780000000", email: "", address: "KG 7 Ave, Kigali", reference: "SHIP-1", note: "Arriving this afternoon" } };
it("requires driver identity, contact and destination when shipping", () => {
  expect(deliveryUpdateSchema.safeParse(data).success).toBe(true);
  for (const patch of [{ driverName: "" }, { phone: "", email: "" }, { address: "" }]) expect(deliveryUpdateSchema.safeParse({ ...data, delivery: { ...data.delivery, ...patch } }).success).toBe(false);
});
it("allows an email instead of phone and retains delivery information", () => {
  expect(deliveryUpdateSchema.parse({ ...data, delivery: { ...data.delivery, phone: "", email: "courier@example.com" } }).delivery).toEqual({ ...data.delivery, phone: "", email: "courier@example.com" });
});
it("allows preparing an order before assigning a driver", () => {
  expect(deliveryUpdateSchema.safeParse({ ...data, status: "Processing", delivery: { ...data.delivery, driverName: "", phone: "" } }).success).toBe(true);
});