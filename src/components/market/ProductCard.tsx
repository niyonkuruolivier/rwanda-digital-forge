import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { money, type Product } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { discountPercent, isDiscounted } from "@/lib/discounts";
import { VerifiedBadge } from "./VerifiedBadge";

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { vendor, wishlist, toggleWish } = useStore();
  const v = vendor(product.vendorId);
  const wished = wishlist.includes(product.id);
  const off = discountPercent(product);
  return (
    <div className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-primary/15 bg-card transition hover:border-primary/50">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link to="/products/$id" params={{ id: product.id }} className="block h-full">
          <img src={product.images[0]} alt={product.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        </Link>
        {off > 0 && <span className={`absolute rounded-full bg-accent font-bold text-accent-foreground ${compact ? "left-1 top-1 px-1 py-0.5 text-[10px] sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs" : "left-3 top-3 px-2.5 py-1 text-xs"}`}>-{off}%</span>}
        <Button variant="secondary" size="icon" onClick={() => toggleWish(product.id)} aria-label={`Save ${product.title}`} aria-pressed={wished} title="Save product" className={`absolute rounded-full bg-card/95 ${compact ? "right-1 top-1 size-6 sm:right-2 sm:top-2 sm:size-8" : "right-2 top-2 size-8"}`}>
          <Heart className={`${compact ? "size-3 sm:size-4" : "size-4"} ${wished ? "fill-accent text-accent" : "text-heading"}`} />
        </Button>
      </div>
      <div className={`flex flex-1 flex-col sm:gap-2 sm:p-4 ${compact ? "gap-1.5 p-2" : "gap-2 p-3"}`}>
        <Link to="/products/$id" params={{ id: product.id }} className={`line-clamp-2 font-semibold text-heading hover:text-primary ${compact ? "min-h-8 break-words text-xs leading-4 sm:min-h-10 sm:text-sm sm:leading-5" : "min-h-10 text-sm leading-5"}`}>{product.title}</Link>
        {v && <Link to="/vendors/$id" params={{ id: v.id }} className={`flex min-w-0 items-center gap-1 text-muted-foreground hover:text-primary ${compact ? "text-[10px] sm:text-xs" : "text-xs"}`}><span className="truncate">{v.name}</span><VerifiedBadge verified={v.verified} compact /></Link>}
        <div className="mt-auto pt-1">
          <p className={`font-extrabold text-heading sm:text-base ${compact ? "text-[11px]" : "text-sm"}`}>{money(product.price)}</p>
          <p className={`min-h-5 text-muted-foreground ${compact ? "text-[10px] sm:text-xs" : "text-xs"}`}>{isDiscounted(product) && <span className="line-through">{money(product.compareAt ?? product.price)}</span>}</p>
        </div>
      </div>
    </div>
  );
}
