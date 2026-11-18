import { describe, expect, it } from "vitest";
import { canVendorTrade, moderateVendor, reviewApplication, vendorSummary, vendorAccountRestricted, type VendorApplication } from "./admin";
import { VENDORS, type Order } from "./data";

const vendor = VENDORS.find((v) => v.id === "kigali-tech");
if (!vendor) throw new Error("Missing demo vendor");
const application: VendorApplication = { id: "a", buyerId: "b", applicant: "Buyer", email: "", vendor, submittedAt: "2026-11-14T00:00:00Z", status: "Pending" };
const order: Order = { id: "o", date: "", customer: "Buyer", address: "", payment: "Mobile Money", total: 10000, paymentStatus: "Paid", paymentReference: "DEMO-1", paidAt: "2026-11-10T00:00:00Z", items: [{ productId: "p", vendorId: vendor.id, title: "Product", price: 10000, qty: 1, image: "", status: "Delivered" }] };
describe("admin demo oversight", () => {
  it("restricts all vendor account activity while blocked or suspended, not buyer or admin access", () => {
    for (const status of ["Blocked", "Suspended"] as const) {
      const restricted = { ...vendor, status };
      expect(vendorAccountRestricted("vendor", restricted)).toBe(true);
      expect(vendorAccountRestricted("buyer", restricted)).toBe(false);
      expect(vendorAccountRestricted("admin", restricted)).toBe(false);
    }
    expect(vendorAccountRestricted("vendor", { ...vendor, status: "Active" })).toBe(false);
  });
  it("restores account activity when suspension ends", () => {
    const end = Date.parse("2026-11-17T01:47:00Z");
    const suspended = { ...vendor, status: "Suspended" as const, suspendedUntil: new Date(end).toISOString() };
    expect(vendorAccountRestricted("vendor", suspended, end - 1)).toBe(true);
    expect(vendorAccountRestricted("vendor", suspended, end)).toBe(false);
  });
  it("shows 13% platform commission and 87% vendor share", () => {
    const summary = vendorSummary([order], [], [], vendor.id);
    expect(summary.gross).toBe(10000);
    expect(summary.commission).toBe(1300);
    expect(summary.vendorShare).toBe(8700);
  });
  it("keeps ledger rounding consistent with the withdrawable item shares", () => {
    const small: Order = { ...order, items: order.items.flatMap(item => [{ ...item, price: 4 }, { ...item, productId: "other", price: 4 }]) };
    const summary = vendorSummary([small], [], [], vendor.id);
    expect(summary.commission).toBe(2);
    expect(summary.vendorShare).toBe(6);
    expect(summary.available).toBe(6);
  });
  it("tracks paid and requested withdrawals separately from available money", () => {
    const summary = vendorSummary([order], [{ id: "w", vendorId: vendor.id, amount: 2000, status: "Paid", requestedAt: "" }, { id: "r", vendorId: vendor.id, amount: 1000, status: "Requested", requestedAt: "" }], [], vendor.id);
    expect(summary.paidOut).toBe(2000);
    expect(summary.requested).toBe(1000);
    expect(summary.available).toBe(5700);
  });
  it("blocking stops trade and unblocking restores it", () => {
    expect(canVendorTrade({ ...vendor, status: "Blocked" })).toBe(false);
    expect(canVendorTrade({ ...vendor, status: "Active" })).toBe(true);
    expect(canVendorTrade(undefined)).toBe(false);
  });
  it("an application requires approval and cannot be reviewed twice", () => {
    expect(application.status).toBe("Pending");
    const approved = reviewApplication(application, "Approved", "now");
    expect(approved.status).toBe("Approved");
    expect(reviewApplication(approved, "Rejected", "later").status).toBe("Approved");
  });
  it("blocking requires and retains a reason", () => {
    expect(() => moderateVendor(vendor, "Blocked", " ")).toThrow();
    expect(moderateVendor(vendor, "Blocked", "Invalid business certificate").blockedReason).toBe("Invalid business certificate");
  });
  it("suspension requires and retains a reason and pauses trading", () => {
    expect(() => moderateVendor(vendor, "Suspended", " ")).toThrow();
    const suspended = moderateVendor(vendor, "Suspended", "Resolve outstanding complaints");
    expect(suspended.blockedReason).toBe("Resolve outstanding complaints");
    expect(canVendorTrade(suspended)).toBe(false);
  });
  it("unblocking and unsuspending restore trading without changing the store", () => {
    for (const status of ["Blocked", "Suspended"] as const) {
      const restored = moderateVendor(moderateVendor(vendor, status, "Review required"), "Active");
      expect(canVendorTrade(restored)).toBe(true);
      expect(restored.blockedReason).toBe("");
      expect(restored.id).toBe(vendor.id);
    }
  });
  it("suspends for the selected number of days and restores trading at the end", () => {
    const start = Date.parse("2026-11-14T01:47:00Z");
    const suspended = moderateVendor(vendor, "Suspended", "Review required", 3, start);
    expect(suspended.suspendedUntil).toBe("2026-11-17T01:47:00.000Z");
    expect(canVendorTrade(suspended, start + 3 * 86400000 - 1)).toBe(false);
    expect(canVendorTrade(suspended, start + 3 * 86400000)).toBe(true);
  });
  it("requires positive whole suspension days", () => {
    for (const days of [0, -1, 1.5, NaN]) expect(() => moderateVendor(vendor, "Suspended", "Review", days)).toThrow();
  });
  it("rejection does not approve a store", () => {
    expect(reviewApplication(application, "Rejected", "now", "Please provide a valid RDB certificate.").status).toBe("Rejected");
  });
  it("requires a rejection reason", () => {
    expect(() => reviewApplication(application, "Rejected", "now", "  ")).toThrow("Give the applicant a reason for rejection.");
  });
  it("retains the rejection reason for the applicant to correct and reapply", () => {
    expect(reviewApplication(application, "Rejected", "now", "  Please provide a valid RDB certificate.  ").rejectionReason).toBe("Please provide a valid RDB certificate.");
  });
  it("complaints keep a vendor's 87% share out of available money", () => {
    const disputed: Order = { ...order, items: order.items.map((i) => ({ ...i, claim: { message: "Damaged", photo: "photo", status: "open", createdAt: "2026-11-14T00:00:00Z" } })) };
    const summary = vendorSummary([disputed], [], [], vendor.id);
    expect(summary.disputed).toBe(8700);
    expect(summary.available).toBe(0);
  });
});