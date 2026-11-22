import type { Product, Vendor } from "./data";

export interface AssistantProduct { id: string; title: string; price: number; stock: number; shop: string; image: string; options: { name: string; values: string[] }[] }

/** Matches in-stock products against every word of the visitor's request (title, category, description, shop). */
export function searchAssistantProducts(products: Product[], vendors: Vendor[], query: string, limit = 6): AssistantProduct[] {
  const words = query.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 1).map((w) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w));
  const shop = (id: string) => vendors.find((v) => v.id === id)?.name ?? "";
  return products
    .filter((p) => p.stock > 0)
    .map((p) => {
      const text = `${p.title} ${p.category} ${p.description} ${shop(p.vendorId)}`.toLowerCase();
      const score = words.reduce((n, w) => n + (p.title.toLowerCase().includes(w) ? 3 : text.includes(w) ? 1 : 0), 0);
      return { p, score };
    })
    .filter((x) => words.length === 0 || x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ p }) => ({ id: p.id, title: p.title, price: p.price, stock: p.stock, shop: shop(p.vendorId), image: p.images[0] ?? "", options: (p.options ?? []).map((o) => ({ name: o.name, values: o.values })) }));
}
