import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listMemberAccounts } from "@/lib/account.functions";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const day = (v?: string | null) => v ? new Date(v).toLocaleDateString("en-GB", { timeZone: "Africa/Kigali", day: "2-digit", month: "short", year: "numeric" }) : "Never";

export function MemberAccounts({ search }: { search: string }) {
  const [type, setType] = useState<"Buyer" | "Vendor" | "All">("Buyer");
  const q = useQuery({ queryKey: ["admin-member-accounts"], queryFn: () => listMemberAccounts() });
  if (q.isPending) return <p className="py-10 text-center text-sm text-muted-foreground">Loading accounts…</p>;
  if (q.isError) return <div className="py-10 text-center"><p className="text-sm text-destructive">Could not load accounts.</p><Button className="mt-3" size="sm" variant="outline" onClick={() => q.refetch()}>Try again</Button></div>;
  const all = q.data;
  const counts = { Buyer: all.filter((a) => a.type === "Buyer").length, Vendor: all.filter((a) => a.type === "Vendor").length, All: all.length };
  const rows = all.filter((a) => (type === "All" || a.type === type) && [a.name, a.email, a.phone, a.city].join(" ").toLowerCase().includes(search.toLowerCase()));
  return <section className="mt-4">
    <div className="grid grid-cols-3 gap-3">{([["Buyer", "Non-vendor accounts"], ["Vendor", "Vendor accounts"], ["All", "All accounts"]] as const).map(([key, label]) => <button key={key} onClick={() => setType(key)} aria-pressed={type === key} className={`rounded-lg border p-4 text-left ${type === key ? "border-primary bg-primary/10" : "bg-card"}`}><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-extrabold">{counts[key]}</p></button>)}</div>
    <div className="mt-4 max-w-full overflow-x-auto border-y bg-card"><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone / city</TableHead><TableHead>Type</TableHead><TableHead>Joined</TableHead><TableHead>Last sign-in</TableHead></TableRow></TableHeader><TableBody>
      {rows.map((a) => <TableRow key={a.id}><TableCell className="font-semibold">{a.name || "—"}</TableCell><TableCell>{a.email}</TableCell><TableCell>{a.phone || "—"}<p className="text-xs text-muted-foreground">{a.city}</p></TableCell><TableCell>{a.type}</TableCell><TableCell className="whitespace-nowrap">{day(a.joined)}</TableCell><TableCell className="whitespace-nowrap">{day(a.lastSignIn)}</TableCell></TableRow>)}
    </TableBody></Table></div>
    {rows.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No accounts found.</p>}
  </section>;
}
