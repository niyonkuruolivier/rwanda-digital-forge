import type { Order, Product } from "./data";
import { hasCompletedPayment } from "./orders";

// Seller product IDs retain their posting timestamp even when a post is edited.
function postedAt(product: Product): number {
  return /^p\d{13}$/.test(product.id) ? Number(product.id.slice(1)) : 0;
}

export function homeProducts(products: Product[], orders: Order[]): Product[] {
  const sales = new Map<string, number>();
  for (const order of orders.filter(hasCompletedPayment)) {
    for (const item of order.items) {
      if (item.claim?.status === "refunded") continue;
      sales.set(item.productId, (sales.get(item.productId) ?? 0) + item.qty);
    }
  }
  return [...products].sort((a, b) => (sales.get(b.id) ?? 0) - (sales.get(a.id) ?? 0) || postedAt(b) - postedAt(a) || a.id.localeCompare(b.id));
}