import { COMMISSION_RATE } from "./data";
// Buyer pays the item subtotal; the platform keeps a commission from it and the vendor gets the rest.
export function cartTotals(lines: { price: number; qty: number }[]) {
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  return { subtotal, total: subtotal };
}
export function splitPayment(amount: number) {
  const commission = Math.round(amount * COMMISSION_RATE);
  return { commission, vendorShare: amount - commission };
}
