import { describe, expect, it } from "vitest";
import type { Order } from "./data";
import { HOLD_MS, itemFunds, vendorBalance, prepareWithdrawal, validateWithdrawalRecipient } from "./withdrawals";

const paidAt = "2026-11-13T00:00:00Z";
const T = Date.parse(paidAt);
const item = { productId: "p", vendorId: "v", title: "x", price: 10000, qty: 1, image: "", status: "Delivered" as const };
const order = (extra = {}): Order => ({ id: "o", date: "", customer: "c", address: "", payment: "", total: 10000, paymentStatus: "Paid", paymentReference: "R", paidAt, items: [{ ...item, ...extra }] });

describe("payment hold", () => {
  const bank = { method: "Bank" as const, provider: "Bank of Kigali", accountNumber: "00123456789", accountName: "Example Vendor" };
  it("requires the registered account name for bank and mobile money", () => {
    for (const method of ["Bank", "Mobile Money"] as const) expect(validateWithdrawalRecipient({ ...bank, method, accountName: " " })).toBeDefined();
  });
  it("requires bank name and bank account number", () => {
    expect(validateWithdrawalRecipient({ ...bank, provider: "" })).toBeDefined();
    expect(validateWithdrawalRecipient({ ...bank, accountNumber: "" })).toBeDefined();
    expect(prepareWithdrawal(5000, 9000, bank)).toEqual(bank);
  });
  it("requires a mobile money provider and a valid phone number", () => {
    const mobile = { ...bank, method: "Mobile Money" as const, provider: "MTN MoMo", accountNumber: "0781234567" };
    expect(validateWithdrawalRecipient(mobile)).toBeUndefined();
    expect(validateWithdrawalRecipient({ ...mobile, accountNumber: "123" })).toBeDefined();
    expect(validateWithdrawalRecipient({ ...mobile, provider: "" })).toBeDefined();
    expect(prepareWithdrawal(5000, 9000, mobile).accountName).toBe("Example Vendor");
  });
  it("does not permit withdrawing held or already requested money", () => {
    expect(() => prepareWithdrawal(9001, 9000, bank)).toThrow();
    expect(() => prepareWithdrawal(1, 0, bank)).toThrow();
  });
  it("money is pending for one day after payment", () => {
    expect(itemFunds(order(), order().items[0]!, T + HOLD_MS - 1)).toBe("pending");
  });
  it("money becomes available automatically after one day without confirmation", () => {
    expect(itemFunds(order(), order().items[0]!, T + HOLD_MS)).toBe("available");
  });
  it("buyer confirmation releases money right away", () => {
    const o = order({ buyerConfirmedAt: paidAt });
    expect(itemFunds(o, o.items[0]!, T + 1)).toBe("available");
  });
  it("an open complaint keeps money held even after one day", () => {
    const o = order({ claim: { message: "bad", createdAt: paidAt, status: "open" } });
    expect(itemFunds(o, o.items[0]!, T + 5 * HOLD_MS)).toBe("disputed");
  });
  it("vendor balance is 90% share minus withdrawals", () => {
    const b = vendorBalance([order()], [{ id: "w", vendorId: "v", amount: 4000, requestedAt: "", status: "Requested" }], "v", T + HOLD_MS);
    expect(b.earned).toBe(9000);
    expect(b.available).toBe(5000);
  });
});
