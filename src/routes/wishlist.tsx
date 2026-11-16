import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "@/components/market/ProductCard";
import { useStore } from "@/lib/store";
export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — Murandasi Market" }, { name: "description", content: "Products you saved for later." }, { property: "og:title", content: "Wishlist — Murandasi Market" }, { property: "og:description", content: "Products you saved for later." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => { const { wishlist, product } = useStore(); const list = wishlist.map(product).filter((p) => !!p);
    return <div className="mx-auto max-w-7xl px-4 py-10"><h1 className="text-2xl font-bold">Your wishlist</h1>
      {list.length === 0 ? <p className="py-16 text-center text-muted-foreground">Tap the heart on any product to save it here.</p> :
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{list.map((p) => <ProductCard key={p.id} product={p} />)}</div>}</div>; },
});
