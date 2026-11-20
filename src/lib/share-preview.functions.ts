import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { SEED_PRODUCTS, VENDORS, type Product, type Vendor } from "./data";
import { SHARE_PREVIEW_IMAGE } from "./share";

const sharePreviewInput = z.object({ kind: z.enum(["store", "product"]), id: z.string().min(1).max(120) });

export interface SharePreview {
  title: string;
  description: string;
  image: string;
}

/** Link crawlers cannot use data: URLs; only absolute https photos work as previews. */
const previewImage = (url: string | undefined) => (url && url.startsWith("https://") ? url : SHARE_PREVIEW_IMAGE);

const GENERIC: SharePreview = {
  title: "Murandasi Market",
  description: "Shop independent Rwandan stores on Murandasi Market.",
  image: SHARE_PREVIEW_IMAGE,
};

/**
 * Public, read-only preview of a store or product for link previews (og:image).
 * Reads only the public catalog rows; never returns private account data.
 */
export const getSharePreview = createServerFn({ method: "GET" })
  .inputValidator((raw) => sharePreviewInput.parse(raw))
  .handler(async ({ data }): Promise<SharePreview> => {
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
      .eq("kind", data.kind)
      .eq("id", data.id)
      .maybeSingle();
    const record = row && !row.deleted ? (row.record as unknown) : undefined;

    if (data.kind === "store") {
      const vendor = (record as Vendor | undefined) ?? VENDORS.find((v) => v.id === data.id);
      if (!vendor) return GENERIC;
      return {
        title: `${vendor.name} — Murandasi Market`,
        description: vendor.bio || "Browse this independent store on Murandasi Market.",
        image: previewImage(vendor.banner || vendor.logo),
      };
    }

    const product = (record as Product | undefined) ?? SEED_PRODUCTS.find((p: Product) => p.id === data.id);
    if (!product) return GENERIC;
    return {
      title: `${product.title} — Murandasi Market`,
      description: product.description || "Photos, price, stock, vendor and reviews for this product.",
      image: previewImage(product.images[0]),
    };
  });
