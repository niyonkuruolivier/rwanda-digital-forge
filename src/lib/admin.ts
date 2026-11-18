import type { Order, Product, Vendor } from "./data";
import { hasCompletedPayment } from "./orders";
import { splitPayment } from "./pricing";
import { itemFunds, vendorBalance, type Withdrawal } from "./withdrawals";
import type { VendorAgreement } from "./vendor-agreement";

export interface VendorApplication {
  id: string; buyerId: string; applicant: string; email: string; vendor: Vendor;
  submittedAt: string; status: "Pending" | "Approved" | "Rejected"; reviewedAt?: string; rejectionReason?: string | undefined; agreement?: VendorAgreement;
}
export interface AdminEvent { id: string; at: string; message: string }

// Demo business state only; never an authentication or authorization check.
export function canVendorTrade(vendor: Vendor | undefined, now = Date.now()) {
  return Boolean(vendor && (!vendor.status || vendor.status === "Active" || (vendor.status === "Suspended" && vendor.suspendedUntil && Date.parse(vendor.suspendedUntil) <= now)));
}

export function vendorAccountRestricted(role: string, vendor: Vendor | undefined, now = Date.now()) {
  return role === "vendor" && Boolean(vendor && !canVendorTrade(vendor, now));
}

export function suspensionEnd(days: number, now = Date.now()): string {
  if (!Number.isSafeInteger(days) || days < 1) throw new Error("Choose a whole number of suspension days, at least 1.");
  const end = now + days * 86400000;
  if (!Number.isFinite(end) || end > 8640000000000000) throw new Error("Suspension duration is too long.");
  return new Date(end).toISOString();
}

export function moderateVendor(vendor: Vendor, status: "Active" | "Blocked" | "Suspended", reason = "", days = 1, now = Date.now()): Vendor {
  if (status !== "Active" && !reason.trim()) throw new Error("A reason is required for blocking or suspension.");
  return { ...vendor, status, blockedReason: status === "Active" ? "" : reason.trim(), suspendedUntil: status === "Suspended" ? suspensionEnd(days, now) : undefined };
}

export function reviewApplication(application: VendorApplication, status: "Approved" | "Rejected", at: string, reason = "") {
  if (application.status !== "Pending") return application;
  if (status === "Rejected" && !reason.trim()) throw new Error("Give the applicant a reason for rejection.");
  return { ...application, status, reviewedAt: at, rejectionReason: status === "Rejected" ? reason.trim() : undefined };
}

export function paymentLedger(orders: Order[]) {
  return orders.filter(hasCompletedPayment).flatMap((order) => [...new Set(order.items.map((i) => i.vendorId))].map((vendorId) => {
    const items = order.items.filter((i) => i.vendorId === vendorId);
    const gross = items.reduce((n, i) => n + i.price * i.qty, 0);
    const commission = items.reduce((sum, item) => sum + splitPayment(item.price * item.qty).commission, 0);
    return { order, vendorId, items, gross, commission, vendorShare: gross - commission };
  }));
}

export function vendorSummary(orders: Order[], withdrawals: Withdrawal[], products: Product[], vendorId: string, now = Date.now()) {
  const ledger = paymentLedger(orders).filter((p) => p.vendorId === vendorId);
  const balance = vendorBalance(orders, withdrawals, vendorId, now);
  const paidOut = withdrawals.filter((w) => w.vendorId === vendorId && w.status === "Paid").reduce((n, w) => n + w.amount, 0);
  const requested = withdrawals.filter((w) => w.vendorId === vendorId && w.status === "Requested").reduce((n, w) => n + w.amount, 0);
  const refunds = ledger.reduce((n, p) => n + p.items.filter((i) => itemFunds(p.order, i, now) === "refunded").reduce((sum, i) => sum + i.price * i.qty, 0), 0);
  return { ...balance, paidOut, requested, refunds, gross: ledger.reduce((n, p) => n + p.gross, 0), commission: ledger.reduce((n, p) => n + p.commission, 0), vendorShare: ledger.reduce((n, p) => n + p.vendorShare, 0), orders: ledger.length, listings: products.filter((p) => p.vendorId === vendorId).length };
}