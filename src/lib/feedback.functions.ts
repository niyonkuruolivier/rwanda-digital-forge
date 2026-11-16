import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { feedbackInput } from "./feedback";

export const submitFeedback = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((value) => feedbackInput.parse(value)).handler(async ({ context, data }) => {
  const [allowed, profile] = await Promise.all([context.supabase.rpc("account_activity_allowed"), context.supabase.from("profiles").select("name,photo").eq("id", context.userId).single()]);
  if (allowed.error || !allowed.data || profile.error || !profile.data) throw new Error("Account access required.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const result = await supabaseAdmin.from("customer_feedback").insert({ user_id: context.userId, target_type: data.targetType, target_id: data.targetId, message: data.message, photos: data.photos, author_name: profile.data.name || "Customer", author_photo: profile.data.photo });
  if (result.error) throw new Error("Could not submit feedback.");
  return true;
});