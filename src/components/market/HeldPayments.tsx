import { AlertTriangle, MessageCircle, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { money, type Order } from "@/lib/data";
import { hasCompletedPayment } from "@/lib/orders";
import { splitPayment } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { holdTimeLeft, itemFunds } from "@/lib/withdrawals";
import { toast } from "sonner";

const digits = (phone?: string) => (phone ?? "").replace(/[^\d+]/g, "");

/** Money not yet in the vendor's balance: 1-day hold and open complaints. */
export function HeldPayments({ vendorId, admin, search = "" }: { vendorId?: string; admin?: boolean; search?: string }) {
  const s = useStore();
  const rows = s.orders.filter(hasCompletedPayment).flatMap((o: Order) => o.items
    .filter((i) => !vendorId || i.vendorId === vendorId)
    .map((i) => ({ o, i, state: itemFunds(o, i) }))
    .filter((r) => (r.state === "pending" || r.state === "disputed") && [r.o.id, r.o.customer, r.i.title, s.vendor(r.i.vendorId)?.name, r.i.claim?.message].join(" ").toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => Number(b.state === "disputed") - Number(a.state === "disputed"));
  const complaints = rows.filter((r) => r.state === "disputed").length;
  return <section className="mt-8">
    <div className="flex flex-wrap items-center gap-2">
      <h2 className="text-xl font-bold">Pending payment</h2>
      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-bold">{rows.length}</span>
      {complaints > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground"><AlertTriangle className="size-3" />{complaints} complaint{complaints > 1 ? "s" : ""}</span>}
    </div>
    <p className="mt-1 text-sm text-muted-foreground">Money held by Murandasi — not in {admin ? "the vendor's" : "your"} balance yet. It is released when the buyer taps "All good", or automatically after 2 days. A complaint keeps it held until solved.</p>
    <div className="mt-4 space-y-3">
      {rows.length === 0 && <p className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">Nothing pending.</p>}
      {rows.map(({ o, i, state }) => {
        const tel = digits(o.phone);
        const bad = state === "disputed";
        return <div key={o.id + i.productId + JSON.stringify(i.options)} className={`rounded-xl border bg-card p-4 shadow-sm ${bad ? "border-destructive" : ""}`}>
          <div className="flex gap-3">
            {bad && i.claim?.photo ? <img src={i.claim.photo} alt="Buyer's photo" className="size-20 shrink-0 rounded-md object-cover" /> : i.image ? <img src={i.image} alt="" className="size-16 shrink-0 rounded-md object-cover" /> : null}
            <div className="min-w-0 flex-1 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2"><b className="text-heading">{money(splitPayment(i.price * i.qty).vendorShare)}</b>
                {bad ? <span className="inline-flex items-center gap-1 text-xs font-bold text-destructive"><AlertTriangle className="size-3" />Complaint — on hold</span> : <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground"><Clock className="size-3" />Releases in {holdTimeLeft(o)}</span>}</div>
              <p className="line-clamp-1">{i.title} × {i.qty}</p>
              <p className="text-xs text-muted-foreground">{o.customer} · {o.id}{admin ? ` · ${s.vendor(i.vendorId)?.name}` : ""}</p>
              {bad && <p className="mt-1 rounded-md bg-destructive/10 p-2 text-xs text-destructive">“{i.claim?.message}”</p>}
            </div>
          </div>
          {bad && <div className="mt-3 flex flex-wrap gap-2">
            {tel && <Button asChild size="sm"><a href={`tel:${tel}`}><Phone />Call buyer</a></Button>}
            {tel && <Button asChild size="sm" variant="outline"><a href={`https://wa.me/${tel.replace("+", "")}`} target="_blank" rel="noopener noreferrer"><MessageCircle />WhatsApp</a></Button>}
            {!tel && <span className="text-xs text-muted-foreground">No phone number on this order</span>}
            {admin && <>
              <Button size="sm" variant="secondary" onClick={async () => { try { if (i.lineId) await s.reviewOrderItem(i, "released"); else if (i.claim) s.updateItem(o.id, i.productId, { claim: { ...i.claim, status: "released" } }, i.options); } catch(error) { toast.error(error instanceof Error ? error.message : "Could not release payment."); } }}>Release to vendor</Button>
              <Button size="sm" variant="outline" onClick={async () => { try { if (i.lineId) await s.reviewOrderItem(i, "refunded"); else if (i.claim) s.updateItem(o.id, i.productId, { claim: { ...i.claim, status: "refunded" } }, i.options); } catch(error) { toast.error(error instanceof Error ? error.message : "Could not refund payment."); } }}>Refund buyer</Button>
            </>}
            {!admin && <span className="self-center text-xs font-semibold text-muted-foreground">Status: waiting for admin to decide</span>}
          </div>}
        </div>;
      })}
    </div>
  </section>;
}
