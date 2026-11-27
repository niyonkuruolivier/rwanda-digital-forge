import type { Product, Vendor } from "./data";
import type { DealStory } from "./stories";

export interface CatalogRow { kind: string; id: string; vendor_id: string; record: unknown; deleted: boolean; created_at?: string }
export function mergeCatalog<T extends { id: string }>(seed: T[], rows: CatalogRow[], kind: string): T[] {
  const result = new Map(seed.map((item) => [item.id, item]));
  for (const row of rows.filter((item) => item.kind === kind)) {
    if (row.deleted) result.delete(row.id);
    else result.set(row.id, (kind === "store" && row.created_at ? { ...(row.record as T), createdAt: row.created_at } : row.record) as T);
  }
  return [...result.values()];
}
export function sharedCatalog(rows: CatalogRow[], seed: { products: Product[]; vendors: Vendor[]; stories: DealStory[] }) {
  return { products: mergeCatalog(seed.products, rows, "product"), vendors: mergeCatalog(seed.vendors, rows, "store"), stories: mergeCatalog(seed.stories, rows, "story") };
}