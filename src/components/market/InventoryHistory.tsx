import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function InventoryHistory({ vendorId }: { vendorId: string }) {
  const store = useStore();
  const history = useQuery({ queryKey: ["inventory-history", vendorId], queryFn: async () => {
    const result = await supabase.from("inventory_history").select("id,product_id,previous_stock,new_stock,reason,created_at").eq("vendor_id", vendorId).order("created_at", { ascending: false }).limit(100);
    if (result.error) throw result.error;
    return result.data;
  }, refetchInterval: 15000 });
  if (history.isPending) return <p className="py-8 text-center text-muted-foreground">Loading inventory history…</p>;
  if (history.isError) return <p role="alert" className="py-8 text-destructive">Could not load inventory history. Refresh to try again.</p>;
  return <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Before</TableHead><TableHead>After</TableHead><TableHead>Reason</TableHead><TableHead>Date</TableHead></TableRow></TableHeader><TableBody>{history.data.map(row => <TableRow key={row.id}><TableCell>{store.product(row.product_id)?.title ?? row.product_id}</TableCell><TableCell>{row.previous_stock}</TableCell><TableCell>{row.new_stock}</TableCell><TableCell>{row.reason}</TableCell><TableCell>{new Date(row.created_at).toLocaleString("en-GB", { timeZone: "Africa/Kigali" })}</TableCell></TableRow>)}{history.data.length === 0 && <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No stock changes recorded yet.</TableCell></TableRow>}</TableBody></Table></div>;
}