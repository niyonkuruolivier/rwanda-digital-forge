import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { storeRatingInput } from "./store-ratings";
export const rateStore = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => storeRatingInput.parse(input)).handler(async ({ context, data }) => {
  const [access, roles, store] = await Promise.all([context.supabase.rpc("account_activity_allowed"), context.supabase.from("user_roles").select("vendor_id").eq("user_id", context.userId), context.supabase.from("marketplace_content").select("deleted").eq("kind", "store").eq("id", data.vendorId).maybeSingle()]);
  if (access.error || !access.data || roles.error || !roles.data) throw new Error("Active account required.");
  if (roles.data.some((role) => role.vendor_id === data.vendorId)) throw new Error("You cannot rate your own store.");
  const { VENDORS } = await import("./data");
  if (store.error || store.data?.deleted || (!store.data && !VENDORS.some((vendor) => vendor.id === data.vendorId))) throw new Error("Store not found.");
  const result = await context.supabase.from("store_ratings").upsert({ user_id: context.userId, vendor_id: data.vendorId, stars: data.stars }, { onConflict: "user_id,vendor_id" });
  if (result.error) throw new Error("Could not save your rating. Please try again.");
  return true;
});