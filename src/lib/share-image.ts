import { createClient } from "@supabase/supabase-js";
import { SEED_PRODUCTS, VENDORS, type Product, type Vendor } from "./data";

export type ShareImageKind = "store" | "product";

/**
 * Server-only helper: reads the public catalog photo for a store or product.
 * Returns the stored value as-is (https URL or in-app data: image).
 */
export async function readCatalogImage(kind: ShareImageKind, id: string): Promise<string | undefined> {
  const url = import.meta.env["VITE_SUPABASE_URL"] as string;
  const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string;
  const client = createClient(url, key, {
    global: {
      fetch: (req, init) => {
        const headers = new Headers(init?.headers);
        headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(req, { ...init, headers });
      },
    },
    auth: { persistSession: false },
  });
  const { data: row } = await client
    .from("marketplace_content")
    .select("record,deleted")
    .eq("kind", kind)
    .eq("id", id)
    .maybeSingle();
  const record = row && !row.deleted ? (row.record as unknown) : undefined;

  if (kind === "store") {
    const vendor = (record as Vendor | undefined) ?? VENDORS.find((v) => v.id === id);
    return vendor ? vendor.banner || vendor.logo : undefined;
  }
  const product = (record as Product | undefined) ?? SEED_PRODUCTS.find((p: Product) => p.id === id);
  return product?.images[0];
}
