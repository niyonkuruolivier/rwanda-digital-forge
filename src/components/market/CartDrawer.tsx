import { Link } from "@tanstack/react-router";
import { Minus, Plus, Store, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/data";
import { cartTotals } from "@/lib/pricing";
import { useStore } from "@/lib/store";

export function useGroupedCart() {
  const { cartLines, vendor } = useStore();
  const groups = new Map<string, typeof cartLines>();
  cartLines.forEach((l) => groups.set(l.product.vendorId, [...(groups.get(l.product.vendorId) ?? []), l]));
  return { groups: [...groups.entries()].map(([id, lines]) => ({ vendor: vendor(id), id, lines })), totals: cartTotals(cartLines.map((l) => ({ price: l.product.price, qty: l.qty }))) };
}

export function CartLines() {
  const { setQty } = useStore();
  const { groups } = useGroupedCart();
  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <div key={g.id} className="rounded-xl border bg-card p-3 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-heading"><Store className="h-4 w-4 text-primary" /> {g.vendor?.name ?? "Vendor"}</div>
          {g.lines.map((l) => (
            <div key={l.productId + JSON.stringify(l.options ?? {})} className="flex gap-3 border-t py-3 first:border-t-0">
              <img src={l.product.images[0]} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium text-heading">{l.product.title}</p>
                {l.options && <p className="text-xs text-muted-foreground">{Object.entries(l.options).map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>}
                <p className="text-sm text-muted-foreground">{money(l.product.price)}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setQty(l.productId, l.qty - 1, l.options)} aria-label="Decrease"><Minus className="h-3 w-3" /></Button>
                  <span className="w-6 text-center text-sm">{l.qty}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setQty(l.productId, l.qty + 1, l.options)} disabled={g.lines.filter(line => line.productId === l.productId).reduce((n, line) => n + line.qty, 0) >= l.product.stock} aria-label="Increase"><Plus className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="ml-auto size-7 text-muted-foreground hover:text-destructive" onClick={() => setQty(l.productId, 0, l.options)} aria-label="Remove"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function TotalsBox() {
  const { totals } = useGroupedCart();
  return (
    <div className="space-y-1.5 text-sm">
      <div className="flex justify-between"><span>Subtotal</span><span>{money(totals.subtotal)}</span></div>
      <div className="flex justify-between border-t pt-2 text-base font-bold text-heading"><span>Total</span><span>{money(totals.total)}</span></div>
    </div>
  );
}

export function CartDrawer() {
  const { cartOpen, setCartOpen, cartCount } = useStore();
  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="flex w-full flex-col bg-background sm:max-w-md">
        <SheetHeader><SheetTitle>Your cart ({cartCount})</SheetTitle></SheetHeader>
        {cartCount === 0 ? <p className="py-10 text-center text-muted-foreground">Your cart is empty.</p> : (
          <>
            <div className="flex-1 overflow-y-auto px-4"><CartLines /></div>
            <div className="space-y-3 border-t p-4">
              <TotalsBox />
              <Button asChild className="w-full" size="lg" onClick={() => setCartOpen(false)}><Link to="/checkout">Checkout</Link></Button>
              <Button asChild variant="outline" className="w-full" onClick={() => setCartOpen(false)}><Link to="/cart">View full cart</Link></Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
