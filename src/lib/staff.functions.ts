import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { STAFF_TASK_IDS } from "./staff-tasks";

async function requireAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (error || !data) throw new Error("Administrator access required.");
}

export const requireHelperAccess = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const admin = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (admin.data) return true;
  const tasks = await context.supabase.from("staff_permissions").select("task").eq("user_id", context.userId).limit(1);
  if (tasks.error || !tasks.data?.length) throw new Error("Administrator access required.");
  return true;
});

export const listHelpers = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await requireAdmin(context);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const rows = await supabaseAdmin.from("staff_permissions").select("user_id,task");
  if (rows.error) throw new Error("Could not load helpers.");
  const ids = [...new Set((rows.data ?? []).map((r) => r.user_id))];
  const profiles = ids.length ? await supabaseAdmin.from("profiles").select("id,name,photo").in("id", ids) : { data: [] as { id: string; name: string; photo: string }[] };
  const helpers = await Promise.all(ids.map(async (id) => {
    const u = await supabaseAdmin.auth.admin.getUserById(id);
    const p = (profiles.data ?? []).find((x) => x.id === id);
    return { id, email: u.data.user?.email ?? "", name: p?.name ?? "", photo: p?.photo ?? "", tasks: (rows.data ?? []).filter((r) => r.user_id === id).map((r) => r.task) };
  }));
  return helpers;
});

export const saveHelper = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ email: z.string().trim().toLowerCase().email().max(255), tasks: z.array(z.enum(STAFF_TASK_IDS)).max(STAFF_TASK_IDS.length) }).parse(v))
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let userId = "";
    for (let page = 1; page <= 20 && !userId; page++) {
      const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw new Error("Could not look up the account.");
      userId = list.users.find((u) => u.email?.toLowerCase() === data.email)?.id ?? "";
      if (list.users.length < 1000) break;
    }
    if (!userId) throw new Error("No account uses this email. Ask the person to sign up first.");
    if (userId === context.userId) throw new Error("You already have every task.");
    const del = await supabaseAdmin.from("staff_permissions").delete().eq("user_id", userId);
    if (del.error) throw new Error("Could not save tasks.");
    if (data.tasks.length) {
      const ins = await supabaseAdmin.from("staff_permissions").insert(data.tasks.map((task) => ({ user_id: userId, task })));
      if (ins.error) throw new Error("Could not save tasks.");
    }
    return true;
  });
