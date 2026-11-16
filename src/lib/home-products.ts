import type { Product } from "./data";

// Seller product IDs retain their posting timestamp even when a post is edited.
function postedAt(product: Product): number {
  return /^p\d{13}$/.test(product.id) ? Number(product.id.slice(1)) : 0;
}

export function homeProducts(products: Product[]): Product[] {
  return [...products].sort((a, b) => postedAt(b) - postedAt(a) || b.rating - a.rating);
}