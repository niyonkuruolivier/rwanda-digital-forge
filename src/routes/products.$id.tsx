import { CustomerFeedback } from "@/components/market/CustomerFeedback";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, ShoppingCart, Store, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/market/ProductCard";
import { money } from "@/lib/data";
import { useStore } from "@/lib/store";
import { canVendorTrade } from "@/lib/admin";
import { ProductGallery } from "@/components/market/ProductGallery";
import { BackButton } from "@/components/market/BackButton";
import { ShareButton } from "@/components/market/ShareButton";
import { SHARE_PREVIEW_IMAGE } from "@/lib/share";

export const Route = createFileRoute("/products/$id")({
  head: () => ({ meta: [{ title: "Product details — Murandasi Market" }, { name: "description", content: "Photos, price, stock, vendor and reviews for this product." }, { property: "og:title", content: "Product details — Murandasi Market" }, { property: "og:description", content: "Photos, price, stock, vendor and reviews for this product." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { property: "og:image", content: SHARE_PREVIEW_IMAGE }, { name: "twitter:image", content: SHARE_PREVIEW_IMAGE }] }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { product, vendor, addToCart, products, wishlist, toggleWish } = useStore();
  const nav = useNavigate();
  const p = product(id);
  const [qty, setQty] = useState(1);
  const [sel, setSel] = useState<Record<string, string>>({});
  if (!p) return <p className="py-24 text-center">Product not found. <Link to="/" className="text-primary">Go home</Link></p>;
  const v = vendor(p.vendorId);
  const blocked = !canVendorTrade(v);
  const more = products.filter((x) => x.vendorId === p.vendorId && x.id !== p.id).slice(0, 4);
  const wished = wishlist.includes(p.id);
  const clamp = (n: number) => Math.min(Math.max(1, n), Math.max(1, p.stock));
  const missing = (p.options ?? []).find((o) => !sel[o.name]);
  const ready = () => {
    if (blocked) { toast.error("This store is currently unavailable for new purchases."); return false; }
    if (missing) { toast.error(`Please choose a ${missing.name.toLowerCase()} first`); return false; }
    return true;
  };
  const chosen = p.options?.length ? sel : undefined;
  const add = () => { if (!ready()) return; addToCart(p.id, qty, chosen); toast.success("Added to cart"); };
  const buy = () => { if (!ready()) return; addToCart(p.id, qty, chosen); nav({ to: "/checkout" }); };

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 md:py-10">
      <div className="grid gap-6 md:grid-cols-2 md:gap-10">
        <ProductGallery
          key={p.id}
          title={p.title}
          images={p.images}
          videoUrl={p.videoUrl}
          wished={wished}
          onToggleWish={() => toggleWish(p.id)}
          overlay={<>
            <BackButton onPhoto />
            <ShareButton size="sm" className="bg-card/60 shadow-md backdrop-blur" path={`/products/${p.id}`} title={`${p.title} — Murandasi Market`} text={money(p.price)} />
          </>}
          mainClassName="md:aspect-[4/3] md:max-h-[68vh]"
        />
        <div className="self-start md:sticky md:top-24">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{p.category}</p>
          <h1 className="mt-1 text-2xl font-extrabold text-heading md:text-3xl">{p.title}</h1>
          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">{money(p.price)}</span>
            {p.compareAt && <><span className="text-lg text-muted-foreground line-through">{money(p.compareAt)}</span><span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">Sale</span></>}
          </div>
          <p className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${p.stock > 0 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${p.stock > 0 ? "bg-primary" : "bg-destructive"}`} />
            {p.stock > 0 ? `In stock · ${p.stock} pieces` : "Out of stock"}
          </p>
          {v && <Link to="/vendors/$id" params={{ id: v.id }} className="mt-4 flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm hover:shadow-md">
            <img src={v.logo} alt="" className="h-10 w-10 rounded-full object-cover" />
            <div className="flex-1"><p className="text-xs text-muted-foreground">Sold by</p><p className="font-semibold text-heading">{v.name}</p></div>
            <Store className="h-4 w-4 text-primary" />
          </Link>}
          <p className="mt-4 leading-relaxed text-muted-foreground">{p.description}</p>
          {(p.options ?? []).map((o) => (
            <div key={o.name} className="mt-5">
              <p className="text-sm font-semibold text-heading">{o.name}{sel[o.name] && <span className="ml-2 font-normal text-muted-foreground">{sel[o.name]}</span>}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {o.values.map((val) => (
                  <button
                    key={val}
                    onClick={() => setSel((prev) => ({ ...prev, [o.name]: val }))}
                    aria-pressed={sel[o.name] === val}
                    className={`rounded-full border-2 px-4 py-1.5 text-sm font-medium transition ${sel[o.name] === val ? "border-primary bg-primary text-primary-foreground" : "bg-card text-heading hover:border-primary/50"}`}
                  >{val}</button>
                ))}
              </div>
            </div>
          ))}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between rounded-xl border bg-card p-3 shadow-sm">
              <span className="text-sm font-medium text-muted-foreground">Quantity</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setQty(clamp(qty - 1))} disabled={qty <= 1} aria-label="Decrease quantity" className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background transition hover:bg-muted disabled:opacity-40"><Minus className="h-4 w-4" /></button>
                <span className="w-10 text-center text-lg font-bold text-heading">{qty}</span>
                <button onClick={() => setQty(clamp(qty + 1))} disabled={qty >= p.stock} aria-label="Increase quantity" className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background transition hover:bg-muted disabled:opacity-40"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button size="lg" disabled={!p.stock || blocked} onClick={add} className="gap-2"><ShoppingCart className="h-4 w-4" /> Add to Cart</Button>
              <Button size="lg" variant="accent" disabled={!p.stock || blocked} onClick={buy} className="gap-2"><Zap className="h-4 w-4" /> Buy Now</Button>
            </div>
            {blocked && <p className="text-sm text-destructive">This store is unavailable for new purchases.</p>}
          </div>
        </div>
      </div>
      <CustomerFeedback targetType="product" targetId={p.id} demo={p.reviews} />
      {more.length > 0 && <section className="mt-10 md:mt-14"><h2 className="text-xl font-bold text-heading">More from {v?.name}</h2><div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">{more.map((x) => <ProductCard key={x.id} product={x} />)}</div></section>}
    </div>
  );
}
