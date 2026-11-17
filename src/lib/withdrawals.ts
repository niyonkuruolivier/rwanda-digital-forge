// Demo escrow + withdrawals. Browser-persisted only: no real payout or gateway.
import type { Order, OrderItem } from "./data";
import { hasCompletedPayment } from "./orders";
import { splitPayment } from "./pricing";

export const HOLD_MS = 2 * 24 * 60 * 60 * 1000;

export type FundsState = "pending" | "disputed" | "available" | "refunded";

export interface WithdrawalRecipient { method: "Bank" | "Mobile Money"; provider: string; accountNumber: string; accountName: string }
export interface Withdrawal { id: string; vendorId: string; amount: number; requestedAt: string; status: "Requested" | "Paid"; paidAt?: string | undefined; recipient?: WithdrawalRecipient }

export function validateWithdrawalRecipient(recipient: WithdrawalRecipient): string | undefined {
  if (recipient.method !== "Bank" && recipient.method !== "Mobile Money") return "Choose Bank or Mobile Money.";
  if (!recipient.accountName.trim()) return "Enter the name registered on this account.";
  if (!recipient.provider.trim()) return recipient.method === "Bank" ? "Enter your bank name." : "Choose your Mobile Money provider.";
  if (recipient.method === "Mobile Money") {
    if (!["MTN MoMo", "Airtel Money"].includes(recipient.provider)) return "Choose your Mobile Money provider.";
    if (!/^(?:0|\+?250)7\d{8}$/.test(recipient.accountNumber.replace(/[\s-]/g, ""))) return "Enter a valid Rwanda mobile number.";
  } else if (!recipient.accountNumber.trim()) return "Enter your bank account number.";
  return undefined;
}

export function prepareWithdrawal(amount: number, available: number, recipient: WithdrawalRecipient): WithdrawalRecipient {
  const error = validateWithdrawalRecipient(recipient);
  if (error) throw new Error(error);
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > available) throw new Error("Choose an amount within your available balance.");
  return { method: recipient.method, provider: recipient.provider.trim(), accountNumber: recipient.accountNumber.trim(), accountName: recipient.accountName.trim() };
}

export function itemFunds(order: Order, item: OrderItem, now = Date.now()): FundsState {
  const claim = item.claim;
  if (claim?.status === "refunded") return "refunded";
  if (claim?.status === "open") return "disputed";
  if (item.buyerConfirmedAt || claim?.status === "released") return "available";
  const paid = order.paidAt ? Date.parse(order.paidAt) : now;
  return now - paid >= HOLD_MS ? "available" : "pending";
}

export function holdTimeLeft(order: Order, now = Date.now()): string {
  const left = (order.paidAt ? Date.parse(order.paidAt) : now) + HOLD_MS - now;
  if (left <= 0) return "0m";
  const d = Math.floor(left / 86_400_000);
  const h = Math.floor((left % 86_400_000) / 3_600_000);
  if (d >= 1) return h >= 1 ? `${d}d ${h}h` : `${d}d`;
  return h >= 1 ? `${h}h` : `${Math.max(1, Math.floor(left / 60_000))}m`;
}

export function vendorBalance(orders: Order[], withdrawals: Withdrawal[], vendorId: string, now = Date.now()) {
  const totals = { pending: 0, disputed: 0, earned: 0 };
  for (const order of orders.filter(hasCompletedPayment)) for (const item of order.items) {
    if (item.vendorId !== vendorId) continue;
    const share = splitPayment(item.price * item.qty).vendorShare;
    const state = itemFunds(order, item, now);
    if (state === "pending") totals.pending += share;
    else if (state === "disputed") totals.disputed += share;
    else if (state === "available") totals.earned += share;
  }
  const withdrawn = withdrawals.filter((w) => w.vendorId === vendorId).reduce((n, w) => n + w.amount, 0);
  return { ...totals, withdrawn, available: Math.max(0, totals.earned - withdrawn) };
}
