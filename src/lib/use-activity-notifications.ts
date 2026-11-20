import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";

export function useActivityNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const key = ["account-activity", user?.id];
  const query = useQuery({
    queryKey: key,
    enabled: Boolean(user),
    refetchInterval: 30000,
    queryFn: async () => {
      const [alerts, reads] = await Promise.all([
        supabase.from("activity_notifications").select("id,title,detail,href,kind,created_at").order("created_at", { ascending: false }).order("id").limit(100),
        supabase.from("notification_reads").select("notification_id").eq("user_id", user?.id ?? ""),
      ]);
      if (alerts.error) throw alerts.error;
      if (reads.error) throw reads.error;
      return { alerts: alerts.data, readIds: reads.data.map(row => row.notification_id) };
    },
  });
  useEffect(() => {
    if (!user) return;
    const refresh = () => { void queryClient.invalidateQueries({ queryKey: ["account-activity", user.id] }); };
    const channel = supabase.channel(`activity-${user.id}-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_notifications" }, refresh)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notification_reads", filter: `user_id=eq.${user.id}` }, refresh)
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user?.id, queryClient]);
  const markRead = async (ids: string[]) => {
    if (!user || !ids.length) return;
    const { error } = await supabase.from("notification_reads").upsert(ids.map(id => ({ user_id: user.id, notification_id: id })), { onConflict: "user_id,notification_id", ignoreDuplicates: true });
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: key });
  };
  return { ...query, signedIn: Boolean(user), alerts: user ? query.data?.alerts ?? [] : [], readIds: user ? query.data?.readIds ?? [] : [], markRead };
}