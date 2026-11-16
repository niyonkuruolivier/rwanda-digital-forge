import { useNavigate } from "@tanstack/react-router";
import { LayoutGrid, Search, Store, TrendingUp } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

interface Suggestion {
  kind: "product" | "category" | "vendor";
  label: string;
  id: string;
}

export function SearchBox() {
  const { products, vendors, categories } = useStore();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suggestions = useMemo<Suggestion[]>(() => {
    const query = q.trim().toLowerCase();
    if (!query) {
      // Popular starting points when nothing is typed yet.
      return [
        ...categories.slice(0, 3).map((c): Suggestion => ({ kind: "category", label: c, id: c })),
        ...products.slice(0, 3).map((p): Suggestion => ({ kind: "product", label: p.title, id: p.id })),
      ];
    }
    const matches = (text: string) => text.toLowerCase().includes(query);
    return [
      ...products.filter((p) => matches(p.title) || matches(p.description)).slice(0, 4).map((p): Suggestion => ({ kind: "product", label: p.title, id: p.id })),
      ...categories.filter(matches).slice(0, 2).map((c): Suggestion => ({ kind: "category", label: c, id: c })),
      ...vendors.filter((v) => matches(v.name)).slice(0, 2).map((v): Suggestion => ({ kind: "vendor", label: v.name, id: v.id })),
    ];
  }, [q, products, vendors, categories]);

  const close = () => setOpen(false);
  const search = (term: string) => {
    close();
    nav({ to: "/shop", search: { q: term || undefined, category: undefined, vendor: undefined } });
  };
  const pick = (s: Suggestion) => {
    setQ(s.kind === "vendor" ? "" : s.label);
    close();
    if (s.kind === "vendor") nav({ to: "/vendors/$id", params: { id: s.id } });
    else if (s.kind === "category") nav({ to: "/shop", search: { q: undefined, category: s.label, vendor: undefined } });
    else search(s.label);
  };

  const icon = (kind: Suggestion["kind"]) =>
    kind === "vendor" ? <Store className="size-4 shrink-0 text-primary" /> : kind === "category" ? <LayoutGrid className="size-4 shrink-0 text-primary" /> : <TrendingUp className="size-4 shrink-0 text-muted-foreground" />;

  return (
    <div className="relative order-last w-full md:order-none md:w-auto md:flex-1">
      <form
        onSubmit={(e) => { e.preventDefault(); search(q); }}
        className="flex h-11 w-full items-center gap-2 rounded-lg border bg-background pl-3 focus-within:ring-2 focus-within:ring-ring"
      >
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          aria-label="Search products and stores"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => { blurTimer.current = setTimeout(close, 150); }}
          onKeyDown={(e) => { if (e.key === "Escape") close(); }}
          placeholder="Search products or stores"
          className="w-full min-w-0 bg-transparent py-2 text-sm outline-none"
        />
        <Button type="submit" size="icon" className="mr-1 shrink-0" aria-label="Search"><Search /></Button>
      </form>
      {open && suggestions.length > 0 && (
        <div role="listbox" aria-label="Search suggestions" className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-lg border bg-card shadow-md">
          {!q.trim() && <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Popular right now</p>}
          {suggestions.map((s) => (
            <button
              key={`${s.kind}-${s.id}`}
              type="button"
              role="option"
              aria-selected="false"
              onMouseDown={(e) => { e.preventDefault(); if (blurTimer.current) clearTimeout(blurTimer.current); pick(s); }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-accent"
            >
              {icon(s.kind)}
              <span className="min-w-0 flex-1 truncate">{s.label}</span>
              <span className="shrink-0 text-[11px] text-muted-foreground">{s.kind === "vendor" ? "Store" : s.kind === "category" ? "Category" : "Product"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
