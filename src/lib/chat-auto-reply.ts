import type { Product } from "./data";

export interface AutoReply { text: string; photos?: string[] }

const has = (s: string, words: string[]) => words.some((w) => s.includes(w));

/** Answers common buyer questions from the product's own listing details. Returns null when the seller must answer. */
export function chatAutoReply(body: string, p: Product | undefined, shopLocation?: string): AutoReply | null {
  if (!p) return null;
  const s = body.toLowerCase();
  const opt = (n: string) => p.options?.find((o) => o.name.toLowerCase() === n)?.values;
  const rwf = (n: number) => `RWF ${n.toLocaleString()}`;
  if (has(s, ["size", "ingano", "taille"])) {
    const v = opt("size");
    return { text: v?.length ? `Available sizes: ${v.join(", ")}.` : "This product has one standard size." };
  }
  if (has(s, ["colour", "color", "ibara", "couleur"])) {
    const v = opt("color") ?? opt("colour");
    return { text: v?.length ? `Available colours: ${v.join(", ")}.` : "This product comes in the colour shown in the photos." };
  }
  if (has(s, ["photo", "picture", "image", "ifoto"])) return { text: p.images.length > 1 ? "Here are more photos:" : "This is the only photo for now:", photos: p.images.slice(0, 6) };
  if (has(s, ["price", "final", "igiciro", "prix", "discount"])) return { text: `The price is fixed at ${rwf(p.price)}${p.compareAt && p.compareAt > p.price ? ` (was ${rwf(p.compareAt)})` : ""}. Pay securely on the website.` };
  if (has(s, ["available", "in stock", "stock", "birahari", "disponible"])) return { text: p.stock > 0 ? `Yes, it is available. ${p.stock} left in stock.` : "Sorry, this product is out of stock right now." };
  if (has(s, ["deliver", "delivery", "today", "kugeza", "livraison"])) return { text: `The shop delivers from ${shopLocation ?? "Rwanda"}. Place your order on the website and the seller will confirm the delivery time and driver details on your order page.` };
  return null;
}
