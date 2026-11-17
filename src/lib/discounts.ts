import type { Product } from "./data";

export function discountPercent(product: Pick<Product, "price" | "compareAt">) {
  return product.compareAt && product.compareAt > product.price && product.price >= 0
    ? Math.round((1 - product.price / product.compareAt) * 100) : 0;
}

export function isDiscounted(product: Pick<Product, "price" | "compareAt">) {
  return !!product.compareAt && product.compareAt > product.price && product.price >= 0;
}

export function applyDiscount(product: Product, percentage: number): Product {
  if (!Number.isInteger(percentage) || percentage < 0 || percentage > 90) throw new Error("Discount must be a whole number between 0% and 90%.");
  const regular = isDiscounted(product) ? product.compareAt ?? product.price : product.price;
  return { ...product, price: Math.round(regular * (1 - percentage / 100)), compareAt: percentage ? regular : undefined };
}