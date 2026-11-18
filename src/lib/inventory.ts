import type { Order, Product } from "./data";
import { hasCompletedPayment } from "./orders";

export function availableCartQuantity(stock: number, requested: number, otherLines = 0) {
  if (!Number.isSafeInteger(stock) || !Number.isSafeInteger(requested) || stock < 0 || requested < 0) return 0;
  return Math.min(requested, Math.max(0, stock - otherLines));
}

export function vendorOrderCounts(orders: Order[], vendorId: string) {
  const own = orders.filter(hasCompletedPayment).map(order => order.items.filter(item => item.vendorId === vendorId));
  const lists = own.filter(items => items.length > 0);
  return { total: lists.length, pending: lists.filter(items => items.some(item => item.status === "Pending")).length, completed: lists.filter(items => items.every(item => item.status === "Delivered")).length };
}

export function lowStockProducts(products: Product[]) { return products.filter(product => product.stock <= 5); }