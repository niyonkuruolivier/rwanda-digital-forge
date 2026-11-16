import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/market/ProductCard";
import { useStore } from "@/lib/store";
import { DealStories } from "@/components/market/DealStories";
import { SHARE_PREVIEW_IMAGE } from "@/lib/share";

type S = { q?: string | undefined; category?: string | undefined; vendor?: string | undefined };
export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): S => ({ q: s['q'] ? String(s['q']) : undefined, category: s['category'] ? String(s['category']) : undefined, vendor: s['vendor'] ? String(s['vendor']) : undefined }),
  head: () => ({ meta: [{ title: "Shop all products — Murandasi Market" }, { name: "description", content: "Browse and filter products by category and vendor." }, { property: "og:title", content: "Shop all products — Murandasi Market" }, { property: "og:description", content: "Browse and filter products by category and vendor." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { property: "og:image", content: SHARE_PREVIEW_IMAGE }, { name: "twitter:image", content: SHARE_PREVIEW_IMAGE }] }),
  component: Shop,
});

function Shop() {
  const navigate = useNavigate();
  const { q, category, vendor } = Route.useSearch();
  const { products, vendors, categories, vendor: getV } = useStore();
  const term = (q ?? "").toLowerCase();
  const list = products.filter((p) => (!category || p.category === category) && (!vendor || p.vendorId === vendor) && (!term || p.title.toLowerCase().includes(term) || (getV(p.vendorId)?.name.toLowerCase().includes(term) ?? false)));
  const chip = (active: boolean) => `block w-full rounded-md px-3 py-1.5 text-left text-sm ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`;
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[200px_1fr] md:py-10">
      <aside className="hidden space-y-6 md:block">
        <div><p className="mb-2 text-sm font-bold text-heading">Category</p>
          <Link to="/shop" search={{ q, vendor, category: undefined }} className={chip(!category)}>All</Link>
          {categories.map((c) => <Link key={c} to="/shop" search={{ q, vendor, category: c }} className={chip(category === c)}>{c}</Link>)}
        </div>
        <div><p className="mb-2 text-sm font-bold text-heading">Vendor</p>
          <Link to="/shop" search={{ q, category, vendor: undefined }} className={chip(!vendor)}>All vendors</Link>
          {vendors.map((v) => <Link key={v.id} to="/shop" search={{ q, category, vendor: v.id }} className={chip(vendor === v.id)}>{v.name}</Link>)}
        </div>
      </aside>
      <section className="min-w-0">
        <div className="mb-6 space-y-4 md:hidden">
          <div className="market-scroll flex gap-2 overflow-x-auto pb-1"><Button asChild size="sm" variant={!category ? "default" : "outline"}><Link to="/shop" search={{ q, vendor }}>All</Link></Button>{categories.map((c) => <Button key={c} asChild size="sm" variant={category === c ? "default" : "outline"}><Link to="/shop" search={{ q, vendor, category: c }}>{c}</Link></Button>)}</div>
          <select aria-label="Filter by store" value={vendor ?? ""} onChange={(e) => navigate({ to: "/shop", search: { q, category, vendor: e.target.value || undefined } })} className="h-10 w-full rounded-md border bg-card px-3 text-sm"><option value="">All stores</option>{vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select>
        </div>
        <DealStories />
        <h1 className="text-2xl font-bold">{q ? `Results for "${q}"` : category ?? "All products"}</h1>
        <p className="text-sm text-muted-foreground">{list.length} items</p>
        <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 md:gap-5">{list.map((p) => <ProductCard key={p.id} product={p} compact />)}</div>
        {list.length === 0 && <div className="py-16 text-center"><p className="text-muted-foreground">No products match your search.</p><Button asChild variant="outline" className="mt-4"><Link to="/shop" search={{}}>Show all products</Link></Button></div>}
      </section>
    </div>
  );
}
