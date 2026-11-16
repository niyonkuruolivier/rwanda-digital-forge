import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CartLines, TotalsBox } from "@/components/market/CartDrawer";
import { useStore } from "@/lib/store";
export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — Murandasi Market" }, { name: "description", content: "Review items from every vendor in one cart." }, { property: "og:title", content: "Cart — Murandasi Market" }, { property: "og:description", content: "Review items from every vendor in one cart." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => { const { cartCount } = useStore();
    return <div className="mx-auto max-w-5xl px-4 py-10"><h1 className="text-2xl font-bold">Shopping cart</h1>
      {cartCount === 0 ? <p className="py-16 text-center text-muted-foreground">Your cart is empty. <Link to="/shop" search={{ q: undefined, category: undefined, vendor: undefined }} className="text-primary">Start shopping</Link></p> :
      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_320px]"><CartLines /><div className="h-fit space-y-4 rounded-xl border bg-card p-5 shadow-sm"><TotalsBox /><Button asChild size="lg" className="w-full"><Link to="/checkout">Proceed to checkout</Link></Button></div></div>}</div>; },
});
