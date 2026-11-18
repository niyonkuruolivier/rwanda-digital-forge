import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { verificationSchema, requireVerificationAdministrator } from "./vendor-verification";

export const setVendorVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => verificationSchema.parse(input))
  .handler(async ({ context, data }) => {
    const admin = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    requireVerificationAdministrator(Boolean(admin.data), admin.error);
    const store = await context.supabase.from("marketplace_content").select("id").eq("kind", "store").eq("id", data.vendorId).eq("deleted", false).maybeSingle();
    if (store.error || !store.data) throw new Error("Only an approved seller can be verified.");
    const saved = await context.supabase.from("vendor_verification").upsert({ vendor_id: data.vendorId, verified: data.verified, updated_at: new Date().toISOString() });
    if (saved.error) throw new Error("Could not save verification.");
    return { vendor_id: data.vendorId, verified: data.verified };
  });