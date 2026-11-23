import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { accountAccess } from "./account-access";
import { z } from "zod";
import { suspensionEnd } from "./admin";

export const getAccount = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const [profile, roles] = await Promise.all([
    context.supabase.from("profiles").select("*").eq("id", context.userId).single(),
    context.supabase.from("user_roles").select("role,vendor_id").eq("user_id", context.userId),
  ]);
  if (profile.error || roles.error) throw new Error("Could not load your account.");
  return { profile: profile.data, ...accountAccess(roles.data ?? []), email: String(context.claims.email ?? "") };
});

export const requireAdminAccount = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (error || !data) throw new Error("Administrator access required.");
  return true;
});

export const moderateVendorAccount = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((value) => z.object({ id: z.string().min(1), status: z.enum(["Active", "Blocked", "Suspended"]), reason: z.string().trim().max(2000).default(""), days: z.number().int().min(1).default(1) }).refine((data) => data.status === "Active" || data.reason.length > 0, { message: "A reason is required for blocking or suspension." }).parse(value))
  .handler(async ({ context, data }) => {
    const allowed = await context.supabase.rpc("has_task", { _user_id: context.userId, _task: "vendors" });
    if (allowed.error || !allowed.data) throw new Error("Administrator access required.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const suspendedUntil = data.status === "Suspended" ? suspensionEnd(data.days) : null;
    const result = await supabaseAdmin.from("vendor_moderation").upsert({ vendor_id: data.id, status: data.status, reason: data.status === "Active" ? "" : data.reason, suspended_until: suspendedUntil, updated_at: new Date().toISOString(), updated_by: context.userId });
    if (result.error) throw new Error("Could not update vendor status.");
    return { suspendedUntil };
  });

export const reviewAccountApplication = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((value) => z.object({ id: z.string(), status: z.enum(["Approved", "Rejected"]), reason: z.string().trim().max(2000).default("") }).refine((data) => data.status !== "Rejected" || data.reason.length > 0, { message: "Give the applicant a reason for rejection.", path: ["reason"] }).parse(value))
  .handler(async ({ context, data }) => {
    const allowed = await context.supabase.rpc("has_task", { _user_id: context.userId, _task: "applications" });
    if (allowed.error || !allowed.data) throw new Error("Administrator access required.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const update = await supabaseAdmin.rpc("review_vendor_account_with_reason", { _application_id: data.id, _status: data.status, _reason: data.reason });
    if (update.error) throw new Error("Could not review application.");
    return true;
  });
export const listMemberAccounts = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const allowed = await context.supabase.rpc("has_task", { _user_id: context.userId, _task: "accounts" });
  if (allowed.error || !allowed.data) throw new Error("Administrator access required.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const users: { id: string; email?: string; created_at: string; last_sign_in_at?: string | null }[] = [];
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error("Could not load accounts.");
    users.push(...data.users);
    if (data.users.length < 1000) break;
  }
  const [roles, profiles] = await Promise.all([
    supabaseAdmin.from("user_roles").select("user_id,role"),
    supabaseAdmin.from("profiles").select("id,name,phone,city,photo"),
  ]);
  if (roles.error || profiles.error) throw new Error("Could not load accounts.");
  return users.map((u) => {
    const r = (roles.data ?? []).filter((x) => x.user_id === u.id).map((x) => x.role);
    const p = (profiles.data ?? []).find((x) => x.id === u.id);
    const type = r.includes("admin") ? "Admin" : r.includes("vendor") ? "Vendor" : "Buyer";
    return { id: u.id, email: u.email ?? "", name: p?.name ?? "", phone: p?.phone ?? "", city: p?.city ?? "", photo: p?.photo ?? "", type, joined: u.created_at, lastSignIn: u.last_sign_in_at ?? null };
  }).sort((a, b) => Date.parse(b.joined) - Date.parse(a.joined));
});
