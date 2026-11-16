import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Phone, Store } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PhotoUpload } from "@/components/market/PhotoUpload";
import { FundsBadge } from "@/components/market/FundsBadge";
import { money, type Order, type OrderItem } from "@/lib/data";
import { buyerOrders } from "@/lib/buyer";
import { useStore } from "@/lib/store";
import { holdTimeLeft, itemFunds } from "@/lib/withdrawals";
import { purchaseOutcome } from "@/lib/purchase-history";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "My orders — Murandasi Market" }, { name: "description", content: "Confirm delivery or report a problem with your orders." }, { property: "og:title", content: "My orders — Murandasi Market" }, { property: "og:description", content: "Confirm delivery or report a problem with your orders." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <ClientOnly fallback={<div className="mx-auto max-w-3xl px-4 py-8"><h1 className="text-2xl font-extrabold">Purchase history</h1></div>}><MyOrders /></ClientOnly>,
});

function MyOrders() {
  const s = useStore();
  const [claimFor, setClaimFor] = useState<{ order: Order; item: OrderItem } | null>(null);
  const [filter, setFilter] = useState("all");
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const orders = buyerOrders(s.orders, s.buyer.id);
  const visible = orders.filter((order) => filter === "all" || order.items.some((item) => filter === "complaints" ? !!item.claim : itemFunds(order, item, now) === filter));
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-extrabold">Purchase history</h1>
      <div className="mt-4"><Label htmlFor="purchase-filter">Purchases</Label><select id="purchase-filter" value={filter} onChange={(e) => setFilter(e.target.value)} className="mt-1 h-10 w-full rounded-md border bg-card px-3"><option value="all">All purchases</option><option value="pending">Awaiting approval</option><option value="available">Released to seller</option><option value="complaints">Complaints</option><option value="refunded">Refunded</option></select></div>
      <div className="mt-6 space-y-4">
        {visible.length === 0 && <p className="py-16 text-center text-muted-foreground">{orders.length ? "No purchases in this view." : "No orders yet."} <Link to="/" className="text-primary">Go shopping</Link></p>}
        {visible.map((order) => <div key={order.id} className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap justify-between gap-2 text-sm"><b className="break-all text-heading">{order.id}</b><span className="text-muted-foreground">{order.date}</span></div>
          <p className="mt-1 break-all text-xs text-muted-foreground">{order.paymentReference} · {money(order.total)}</p>
          <div className="mt-3 space-y-3">{order.items.map((item) => {
            const state = itemFunds(order, item, now);
            const shop = item.shop ?? s.vendor(item.vendorId);
            const phone = (s.vendor(item.vendorId)?.phone || shop?.phone || "").replace(/[^\d+]/g, "");
            return <div key={item.productId + JSON.stringify(item.options)} className="flex gap-3 border-t pt-3">
              <img src={item.image} alt="" className="size-16 shrink-0 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold text-heading">{item.title} × {item.qty}</p>
                <p className="text-xs text-muted-foreground">{money(item.price * item.qty)} · {item.status}</p>
                {item.options && <p className="mt-1 text-xs text-muted-foreground">{Object.entries(item.options).map(([key, value]) => `${key}: ${value}`).join(" · ")}</p>}
                <Button asChild variant="link" size="sm" className="h-auto max-w-full justify-start whitespace-normal px-0 py-2 text-left"><Link to="/vendors/$id" params={{ id: item.vendorId }}><Store className="shrink-0" />{shop?.name ?? "Purchased shop"}</Link></Button>
                {shop?.location && <p className="text-xs text-muted-foreground">{shop.location}</p>}
                {phone ? <Button asChild size="sm" variant="outline" className="my-2"><a href={`tel:${phone}`}><Phone />{phone}</a></Button> : <p className="my-2 text-xs text-muted-foreground">Shop phone not provided</p>}
                <FundsBadge state={state} left={holdTimeLeft(order, now)} />
                <p className="mt-1 text-xs text-muted-foreground">{purchaseOutcome(order, item, now)}</p>
                {item.claim && <div className="mt-3 space-y-2 border-l-2 border-destructive pl-3"><p className="text-xs text-muted-foreground">Complaint submitted {new Date(item.claim.createdAt).toLocaleString("en-GB", { timeZone: "Africa/Kigali" })}</p>{item.claim.photo && <a href={item.claim.photo} target="_blank" rel="noopener noreferrer" aria-label="Open complaint photo"><img src={item.claim.photo} alt="Your complaint evidence" className="max-h-40 w-full rounded-md object-contain" /></a>}<p className="break-words text-sm">{item.claim.message}</p></div>}
                {state === "pending" && <div className="mt-2 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => { s.updateItem(order.id, item.productId, { buyerConfirmedAt: new Date().toISOString() }, item.options); toast.success("Approved. Demo funds released to the seller."); }}><CheckCircle2 />All good</Button>
                  <Button size="sm" variant="outline" onClick={() => setClaimFor({ order, item })}><AlertTriangle />Report a problem</Button>
                </div>}
              </div>
            </div>;
          })}</div>
        </div>)}
      </div>
      <Dialog open={!!claimFor} onOpenChange={(o) => !o && setClaimFor(null)}>
        <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg">
          <DialogHeader><DialogTitle>Report a problem</DialogTitle><DialogDescription>{claimFor?.item.title}</DialogDescription></DialogHeader>
          {claimFor && <ClaimForm onDone={(message, photo) => { const currentOrder = s.orders.find((o) => o.id === claimFor.order.id); if (!currentOrder || itemFunds(currentOrder, claimFor.item) !== "pending") { setClaimFor(null); toast.error("The 1-day hold has ended; this payment is already released."); return; } s.submitComplaint(claimFor.order.id, claimFor.item.productId, claimFor.item.options, message, photo); setClaimFor(null); toast.success("Complaint saved. Demo funds remain held for admin review."); }} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ClaimForm({ onDone }: { onDone: (message: string, photo: string) => void }) {
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState("");
  const [busy, setBusy] = useState(false);
  return <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (!busy && photo && message.trim()) onDone(message.trim(), photo); }}>
    <PhotoUpload id="claim-photo" label="Photo of the item" value={photo} onChange={setPhoto} onBusyChange={setBusy} />
    <div className="space-y-2"><Label htmlFor="claim-msg">What is wrong?</Label><Textarea id="claim-msg" required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. Wrong size, damaged, not as shown" /></div>
    <Button type="submit" className="w-full" disabled={busy || !message.trim() || !photo}>Send complaint</Button>
  </form>;
}
