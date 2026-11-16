import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, Shapes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/market/ProductCard";
import { useStore } from "@/lib/store";
import { DealStories } from "@/components/market/DealStories";
import { HorizontalBrowse } from "@/components/market/HorizontalBrowse";
import { homeProducts } from "@/lib/home-products";
import { SHARE_PREVIEW_IMAGE } from "@/lib/share";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Murandasi Market — Your everyday marketplace" }, { name: "description", content: "Shop electronics, fashion, home decor and more from independent stores in Rwanda. Prices in RWF, one shopping cart." }, { property: "og:title", content: "Murandasi Market — Your everyday marketplace" }, { property: "og:description", content: "Find products and independent stores in Rwanda. Browse by category and shop in RWF." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { property: "og:image", content: SHARE_PREVIEW_IMAGE }, { name: "twitter:image", content: SHARE_PREVIEW_IMAGE }] }),
  component: Home,
});

function Home() {
  const { products, vendors, categories, categoryImages } = useStore();
  const picks = homeProducts(products).slice(0, 8);
  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-2 md:pt-10">
      <DealStories />
      <section aria-labelledby="categories-title">
        <h1 id="categories-title" className="text-lg font-bold">What are you shopping for?</h1>
        <HorizontalBrowse label="categories" className="mt-2">
          {categories.map((category) => <Button key={category} asChild variant="ghost" className="h-auto w-[88px] shrink-0 flex-col gap-2 whitespace-normal p-0 hover:bg-transparent md:w-[140px]"><Link to="/shop" search={{ category }}><div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-muted">{categoryImages[category] ? <img src={categoryImages[category]} alt="" className="h-full w-full object-cover transition-transform duration-300 motion-safe:hover:scale-105" /> : <Shapes className="size-9 text-primary" />}</div><span className="text-center text-xs font-semibold md:text-sm">{category}</span></Link></Button>)}
        </HorizontalBrowse>
      </section>
      <section className="pt-4 md:pt-7" aria-labelledby="stores-title">
        <div className="flex items-center justify-between"><h2 id="stores-title" className="text-lg font-bold md:text-xl">Explore stores</h2><span className="text-xs text-muted-foreground">{vendors.length} independent stores</span></div>
        <HorizontalBrowse label="stores" className="mt-2">
          {vendors.map((v) => <Link key={v.id} to="/vendors/$id" params={{ id: v.id }} className="w-[240px] shrink-0 snap-start overflow-hidden rounded-lg border bg-card transition hover:border-primary/40 md:w-[280px]"><div className="relative h-32 overflow-hidden md:h-40"><img src={v.banner} alt={v.name} className="h-full w-full object-cover" /><span className="absolute bottom-2 left-2 rounded-md bg-card px-2 py-1 text-[11px] font-medium text-heading">{products.filter((p) => p.vendorId === v.id).length} products</span></div><div className="p-3"><h3 className="truncate text-sm font-bold">{v.name}</h3><p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{v.location}</p></div></Link>)}
        </HorizontalBrowse>
      </section>
      <section className="pt-4 md:pt-7" aria-labelledby="picks-title">
        <div className="flex items-center justify-between gap-3"><h2 id="picks-title" className="text-lg font-bold md:text-xl">Picked for you</h2><Button asChild variant="link" size="sm"><Link to="/shop" search={{}}>See all<ArrowRight /></Link></Button></div>
        <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-5">{picks.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </section>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t pt-6"><div><h2 className="text-lg font-bold">Your store belongs here.</h2><p className="mt-1 text-sm text-muted-foreground">Bring your products to Murandasi Market.</p></div><Button asChild variant="outline"><Link to="/become-vendor">Start selling<ArrowRight /></Link></Button></div>
    </div>
  );
}
