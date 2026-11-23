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

async function requireAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (error || !data) throw new Error("Administrator access required.");
}

/** Admin only: buyers with at least one paid order, with their block status. */
export const listPayingCustomers = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await requireAdmin(context);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const orders = await supabaseAdmin.from("shared_orders").select("buyer_id,record").eq("record->>paymentStatus", "Paid");
  if (orders.error) throw new Error("Could not load paying customers.");
  const stats = new Map<string, { orders: number; total: number }>();
  for (const o of orders.data ?? []) {
    const s = stats.get(o.buyer_id) ?? { orders: 0, total: 0 };
    s.orders += 1; s.total += Number((o.record as { total?: number })?.total ?? 0);
    stats.set(o.buyer_id, s);
  }
  const ids = [...stats.keys()];
  if (!ids.length) return [];
  const profiles = await supabaseAdmin.from("profiles").select("id,name,phone,city").in("id", ids);
  const out = [];
  for (const id of ids) {
    const u = await supabaseAdmin.auth.admin.getUserById(id);
    const p = (profiles.data ?? []).find((x) => x.id === id);
    const banned = (u.data.user as { banned_until?: string | null } | null)?.banned_until;
    out.push({ id, email: u.data.user?.email ?? "", name: p?.name ?? "", phone: p?.phone ?? "", city: p?.city ?? "", ...stats.get(id)!, blocked: !!banned && Date.parse(banned) > Date.now() });
  }
  return out.sort((a, b) => b.total - a.total);
});

/** Admin only: block or unblock a customer's sign-in. */
export const setCustomerBlocked = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ id: z.string().uuid(), blocked: z.boolean() }).parse(v))
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    if (data.id === context.userId) throw new Error("You cannot block yourself.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const isAdmin = await supabaseAdmin.rpc("has_role", { _user_id: data.id, _role: "admin" });
    if (isAdmin.data) throw new Error("Administrators cannot be blocked.");
    const r = await supabaseAdmin.auth.admin.updateUserById(data.id, { ban_duration: data.blocked ? "876000h" : "none" });
    if (r.error) throw new Error("Could not update this customer.");
    return true;
  });
