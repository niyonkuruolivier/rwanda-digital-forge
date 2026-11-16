import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CATEGORIES } from "./data";
import { safeLiveUrl } from "./stories";
import { categoryNameSchema, requireProductCategory } from "./categories";
import { catalogPhotoSchema, productImagesSchema, productVideoSchema } from "./product-media";
import { categoryPictureSchema, removePostSchema, requireCatalogAdministrator } from "./catalog-moderation";

const photo = catalogPhotoSchema;
const productSchema = z.object({ id: z.string().min(1).max(100), vendorId: z.string(), title: z.string().trim().min(1).max(200), category: categoryNameSchema, price: z.number().int().nonnegative(), compareAt: z.number().int().nonnegative().optional(), stock: z.number().int().nonnegative(), description: z.string().max(10_000), images: productImagesSchema, videoUrl: productVideoSchema.optional(), rating: z.number().min(0).max(5), reviews: z.array(z.object({ author: z.string(), rating: z.number(), text: z.string(), date: z.string() })).max(100), options: z.array(z.object({ name: z.string().min(1).max(50), values: z.array(z.string().min(1).max(100)).min(1).max(100) })).max(10).optional() });
const storySchema = z.object({ id: z.string().min(1).max(100), vendorId: z.string(), title: z.string().trim().min(1).max(80), image: photo.refine(Boolean), productId: z.string().optional(), isLive: z.boolean(), liveUrl: z.string().optional(), createdAt: z.number(), liveSince: z.number().optional() }).refine((s) => !s.isLive || Boolean(safeLiveUrl(s.liveUrl ?? "")), "A valid HTTPS live link is required.");
const storeSchema = z.object({ id: z.string().min(1), name: z.string().trim().min(1).max(200), location: z.string().trim().min(1).max(200), bio: z.string().max(5000), logo: photo, banner: photo, phone: z.string().max(50).optional(), rating: z.number(), joined: z.string() });

export const publishCatalog = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ kind: z.enum(["product", "story", "store"]), record: z.unknown(), deleted: z.boolean().default(false) }).parse(input))
  .handler(async ({ context, data }) => {
    const roles = await context.supabase.from("user_roles").select("vendor_id").eq("user_id", context.userId).eq("role", "vendor").single();
    const vendorId = roles.data?.vendor_id;
    const access = await context.supabase.rpc("account_activity_allowed");
    if (!vendorId || access.error || !access.data) throw new Error("Active seller access required.");
    const record = data.kind === "product" ? productSchema.parse(data.record) : data.kind === "story" ? storySchema.parse(data.record) : storeSchema.parse(data.record);
    if (data.kind === "product" && "category" in record && !data.deleted) {
      const categories = await context.supabase.from("product_categories").select("name");
      if (categories.error) throw new Error("Could not check available categories.");
      requireProductCategory(record.category, [...CATEGORIES, ...(categories.data ?? []).map((c) => c.name)]);
    }
    if (("vendorId" in record ? record.vendorId : record.id) !== vendorId) throw new Error("Choose content from your own store.");
    const existing = await context.supabase.from("marketplace_content").select("vendor_id,record").eq("kind", data.kind).eq("id", record.id).maybeSingle();
    if (existing.error || (existing.data && existing.data.vendor_id !== vendorId)) throw new Error("Cannot edit another store's content.");
    if (data.kind === "store" && !existing.data) throw new Error("Your approved store is not available yet.");
    if (data.kind === "story" && "productId" in record && record.productId) {
      const product = await context.supabase.from("marketplace_content").select("vendor_id,deleted").eq("kind", "product").eq("id", record.productId).maybeSingle();
      const { SEED_PRODUCTS } = await import("./data");
      const owner = product.data ? product.data.deleted ? undefined : product.data.vendor_id : SEED_PRODUCTS.find((p) => p.id === record.productId)?.vendorId;
      if (product.error || owner !== vendorId) throw new Error("Choose a product from your own store.");
    }
    const saved = await context.supabase.from("marketplace_content").upsert({ kind: data.kind, id: record.id, vendor_id: vendorId, record: JSON.parse(JSON.stringify(record)), deleted: data.deleted }, { onConflict: "kind,id" });
    if (saved.error) throw new Error("Could not publish your changes. Please try again.");
    return true;
  });
export const addProductCategory = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ name: categoryNameSchema }).parse(input))
  .handler(async ({ context, data }) => {
    const admin = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (admin.error || !admin.data) throw new Error("Administrator access required.");
    if (CATEGORIES.some((name) => name.toLowerCase() === data.name.toLowerCase())) throw new Error("This category already exists.");
    const result = await context.supabase.from("product_categories").insert({ name: data.name });
    if (result.error) throw new Error(result.error.code === "23505" ? "This category already exists." : "Could not add category.");
    return data.name;
  });

export const updateCategoryPicture = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input) => categoryPictureSchema.parse(input))
  .handler(async ({ context, data }) => {
    const admin = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    requireCatalogAdministrator(Boolean(admin.data), admin.error);
    const rows = await context.supabase.from("product_categories").select("name");
    if (rows.error) throw new Error("Could not check categories.");
    requireProductCategory(data.name, [...CATEGORIES, ...(rows.data ?? []).map((row) => row.name)]);
    const saved = await context.supabase.from("product_categories").upsert(data, { onConflict: "name" });
    if (saved.error) throw new Error("Could not save category picture.");
    return data;
  });

export const removeCatalogPost = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input) => removePostSchema.parse(input))
  .handler(async ({ context, data }) => {
    const admin = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    requireCatalogAdministrator(Boolean(admin.data), admin.error);
    const existing = await context.supabase.from("marketplace_content").select("vendor_id,record").eq("kind", data.kind).eq("id", data.id).maybeSingle();
    if (existing.error) throw new Error("Could not find post.");
    const { SEED_PRODUCTS } = await import("./data");
    const { SEED_STORIES } = await import("./stories");
    const seed = data.kind === "product" ? SEED_PRODUCTS.find((p) => p.id === data.id) : SEED_STORIES.find((p) => p.id === data.id);
    const vendorId = existing.data?.vendor_id ?? seed?.vendorId;
    const record = existing.data?.record ?? seed;
    if (!vendorId || !record) throw new Error("Post not found.");
    const saved = await context.supabase.from("marketplace_content").upsert({ kind: data.kind, id: data.id, vendor_id: vendorId, record: JSON.parse(JSON.stringify(record)), deleted: true, admin_removed: true }, { onConflict: "kind,id" });
    if (saved.error) throw new Error("Could not delete post.");
    return true;
  });
