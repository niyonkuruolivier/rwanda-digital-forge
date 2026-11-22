import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/** Seller dashboard shortcut to buyer conversations for this shop. */
export function SellerChatsCard({ vendorId }: { vendorId: string | null | undefined }) {
  const q = useQuery({
    enabled: !!vendorId,
    queryKey: ["seller-chats", vendorId],
    refetchInterval: 15000,
    queryFn: async () => {
      const { data, error } = await supabase.from("chat_threads").select("id,buyer_name,product_title,last_at").eq("vendor_id", vendorId!).order("last_at", { ascending: false }).limit(3);
      if (error) throw error;
      return data;
    },
  });
  if (!vendorId) return null;
  const list = q.data ?? [];
  return (
    <section className="mt-6 rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-semibold"><MessageCircle className="h-5 w-5 text-primary" />Customer chats</h2>
        <Link to="/messages" className="text-sm font-medium text-primary">Open all</Link>
      </div>
      {list.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">No customer messages yet.</p> : (
        <ul className="mt-3 divide-y">
          {list.map((t) => (
            <li key={t.id}><Link to="/messages" search={{ t: t.id }} className="flex items-center gap-3 py-2">
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{t.buyer_name || "Customer"}</span><span className="block truncate text-xs text-muted-foreground">{t.product_title}</span></span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link></li>
          ))}
        </ul>
      )}
    </section>
  );
}
