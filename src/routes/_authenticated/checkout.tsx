import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, CreditCard, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CartLines, TotalsBox, useGroupedCart } from "@/components/market/CartDrawer";
import { useStore } from "@/lib/store";
import { demoPaymentConfirmation } from "@/lib/orders";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Murandasi Market" }, { name: "description", content: "Enter shipping and payment details to place your order." }, { property: "og:title", content: "Checkout — Murandasi Market" }, { property: "og:description", content: "Enter shipping and payment details to place your order." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Checkout,
});

function Checkout() {
  const { cartLines, placeOrder, buyer } = useStore();
  const { totals } = useGroupedCart();
  const [pay, setPay] = useState<"Mobile Money" | "Credit Card">("Mobile Money");
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState("");

  if (done) return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <CheckCircle2 className="mx-auto h-16 w-16 text-primary" />
      <h1 className="mt-4 text-3xl font-extrabold">Order confirmed!</h1>
      <p className="mt-2 text-muted-foreground">Order <b className="text-heading">{done}</b> was placed. Each vendor will ship their items separately.</p>
      <p className="mt-4 font-semibold text-primary">Demo payment completed</p>
      <p className="mt-1 break-all text-sm text-muted-foreground">Payment reference: {reference}</p>
      <p className="mt-4 text-sm text-muted-foreground">When your items arrive, confirm them in My orders — or report a problem within 1 day.</p>
      <div className="mt-8 flex justify-center gap-3"><Button asChild size="lg" variant="outline"><Link to="/orders">My orders</Link></Button><Button asChild size="lg"><Link to="/">Continue shopping</Link></Button></div>
    </div>
  );
  if (cartLines.length === 0) return <p className="py-24 text-center text-muted-foreground">Your cart is empty. <Link to="/" className="text-primary">Go shopping</Link></p>;

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setTimeout(() => {
      const id = "MM-" + crypto.randomUUID();
      const confirmation = demoPaymentConfirmation(crypto.randomUUID(), new Date().toISOString());
      const placed = placeOrder({ id, buyerId: buyer.id, ...confirmation, date: new Date().toISOString().slice(0, 10), customer: String(f.get("name")), phone: String(f.get("phone")), address: `${f.get("address")}, ${f.get("city")}`, payment: pay, total: totals.total,
        items: cartLines.map((l) => ({ productId: l.productId, vendorId: l.product.vendorId, title: l.product.title, price: l.product.price, qty: l.qty, image: l.product.images[0] ?? "", status: "Pending" as const, options: l.options })) });
      if (!placed) { setBusy(false); toast.error("A store in your cart is blocked. Remove its items before paying."); return; }
      setDone(id);
      setReference(confirmation.paymentReference);
    }, 900);
  };
  return (
    <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">Shipping address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label htmlFor="name">Full name</Label><Input id="name" name="name" defaultValue={buyer.name} required /></div>
            <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" defaultValue={buyer.phone} required placeholder="+250 7xx xxx xxx" /></div>
            <div><Label htmlFor="city">City</Label><Input id="city" name="city" defaultValue={buyer.city} required /></div>
            <div className="sm:col-span-2"><Label htmlFor="address">Street address</Label><Input id="address" name="address" defaultValue={buyer.address} required /></div>
          </div>
        </div>
        <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">Payment method</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {([["Mobile Money", Smartphone], ["Credit Card", CreditCard]] as const).map(([m, Icon]) => (
              <Button type="button" variant="outline" aria-pressed={pay === m} disabled={busy} key={m} onClick={() => setPay(m)} className={`h-auto justify-start gap-3 rounded-lg border-2 p-4 text-left ${pay === m ? "border-primary bg-primary/5" : ""}`}><Icon className="h-5 w-5 text-primary" /><span className="font-medium text-heading">{m}</span></Button>
            ))}
          </div>
          {pay === "Mobile Money" ? <div><Label htmlFor="momo">Mobile Money number</Label><Input id="momo" required placeholder="07xx xxx xxx" /></div> :
            <div className="grid gap-4 sm:grid-cols-3"><div className="sm:col-span-3"><Label htmlFor="card">Card number</Label><Input id="card" required placeholder="4242 4242 4242 4242" /></div><div><Label htmlFor="exp">Expiry</Label><Input id="exp" required placeholder="MM/YY" /></div><div><Label htmlFor="cvc">CVC</Label><Input id="cvc" required placeholder="123" /></div></div>}
          <p className="text-xs text-muted-foreground">Demo checkout — no real payment is taken.</p>
        </div>
      </div>
      <aside className="h-fit space-y-4 md:sticky md:top-24">
        <CartLines />
        <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm"><TotalsBox /><Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? "Completing demo payment…" : "Complete demo payment"}</Button></div>
      </aside>
    </form>
  );
}
