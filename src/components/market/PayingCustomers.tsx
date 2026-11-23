import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { listPayingCustomers, setCustomerBlocked } from "@/lib/account.functions";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function PayingCustomers({ search }: { search: string }) {
  const qc = useQueryClient();
  const toggle = useServerFn(setCustomerBlocked);
  const q = useQuery({ queryKey: ["admin-paying-customers"], queryFn: () => listPayingCustomers() });
  if (q.isPending) return <p className="py-6 text-center text-sm text-muted-foreground">Loading paying customers…</p>;
  if (q.isError) return <p className="py-6 text-center text-sm text-destructive">Could not load paying customers.</p>;
  const rows = q.data.filter((a) => [a.name, a.email, a.phone, a.city].join(" ").toLowerCase().includes(search.toLowerCase()));
  const act = async (id: string, blocked: boolean, name: string) => {
    if (blocked && !window.confirm(`Block ${name || "this customer"}? They will not be able to sign in.`)) return;
    try { await toggle({ data: { id, blocked } }); toast.success(blocked ? "Customer blocked" : "Customer unblocked"); qc.invalidateQueries({ queryKey: ["admin-paying-customers"] }); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Could not update."); }
  };
  return <section className="mt-6">
    <h3 className="text-lg font-bold">Customers who paid <span className="text-sm font-normal text-muted-foreground">({q.data.length})</span></h3>
    <div className="mt-3 max-w-full overflow-x-auto border-y bg-card"><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone / city</TableHead><TableHead>Paid orders</TableHead><TableHead>Total paid</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader><TableBody>
      {rows.map((a) => <TableRow key={a.id}><TableCell className="font-semibold">{a.name || "—"}</TableCell><TableCell>{a.email}</TableCell><TableCell>{a.phone || "—"}<p className="text-xs text-muted-foreground">{a.city}</p></TableCell><TableCell>{a.orders}</TableCell><TableCell className="whitespace-nowrap">RWF {a.total.toLocaleString()}</TableCell><TableCell>{a.blocked ? <span className="font-semibold text-destructive">Blocked</span> : "Active"}</TableCell><TableCell>{a.blocked ? <Button size="sm" variant="outline" onClick={() => act(a.id, false, a.name)}>Unblock</Button> : <Button size="sm" variant="destructive" onClick={() => act(a.id, true, a.name)}>Block</Button>}</TableCell></TableRow>)}
    </TableBody></Table></div>
    {rows.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No paying customers yet.</p>}
  </section>;
}
