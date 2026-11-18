import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Eye, Package, Radio, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { money } from "@/lib/data";
import { isStoryActive, safeLiveUrl } from "@/lib/stories";
import { RemovePostButton } from "./RemovePostButton";

export function AdminPosts({ search, now }: { search: string; now: number }) {
  const s = useStore();
  const [view, setView] = useState<"products" | "stories">("products");
  const [previewId, setPreviewId] = useState<string>();
  const matches = (...values: (string | undefined)[]) => values.join(" ").toLowerCase().includes(search.toLowerCase());
  const products = s.products.filter(p => matches(p.title, p.category, s.vendor(p.vendorId)?.name));
  const stories = s.stories.filter(story => matches(story.title, s.vendor(story.vendorId)?.name));
  const preview = s.stories.find(story => story.id === previewId);
  const liveUrl = preview?.isLive ? safeLiveUrl(preview.liveUrl ?? "") : undefined;

  return <>
    <div className="mt-4 flex gap-2 border-b pb-3" role="group" aria-label="Post type">
      <Button variant={view === "products" ? "default" : "outline"} aria-pressed={view === "products"} onClick={() => setView("products")}><Package className="size-4" />Products ({products.length})</Button>
      <Button variant={view === "stories" ? "default" : "outline"} aria-pressed={view === "stories"} onClick={() => setView("stories")}><Radio className="size-4" />Stories ({stories.length})</Button>
    </div>
    <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {view === "products" ? products.map(p => <article key={p.id} className="min-w-0 overflow-hidden rounded-lg border bg-card">
        <Link to="/products/$id" params={{ id: p.id }} aria-label={`View ${p.title}`} className="block aspect-[4/3] bg-muted"><img src={p.images[0]} alt={p.title} className="h-full w-full object-contain" /></Link>
        <div className="space-y-3 p-3">
          <div><Link to="/products/$id" params={{ id: p.id }} className="block break-words font-semibold">{p.title}</Link><p className="text-xs text-muted-foreground">{p.category} · {p.stock} in stock</p></div>
          <StoreLink id={p.vendorId} name={s.vendor(p.vendorId)?.name} />
          <p className="font-bold text-primary">{money(p.price)}</p>
          <div className="flex items-center justify-between gap-2"><Button asChild size="sm" variant="outline"><Link to="/products/$id" params={{ id: p.id }}><Eye />View product</Link></Button><RemovePostButton kind="product" id={p.id} title={p.title} /></div>
        </div>
      </article>) : stories.map(story => <article key={story.id} className="min-w-0 overflow-hidden rounded-lg border bg-card">
        <Button variant="ghost" className="h-auto w-full rounded-none p-0" aria-label={`Preview ${story.title}`} onClick={() => setPreviewId(story.id)}><span className="block aspect-[4/3] w-full bg-muted"><img src={story.image} alt={story.title} className="h-full w-full object-contain" /></span></Button>
        <div className="space-y-3 p-3">
          <div><h3 className="break-words font-semibold">{story.title}</h3><p className="text-xs text-primary">{story.isLive ? "LIVE · " : "Status · "}{isStoryActive(story, now) ? "Active" : "Expired"}</p></div>
          <StoreLink id={story.vendorId} name={s.vendor(story.vendorId)?.name} />
          <div className="flex items-center justify-between gap-2"><Button size="sm" variant="outline" onClick={() => setPreviewId(story.id)}><Eye />View story</Button><RemovePostButton kind="story" id={story.id} title={story.title} /></div>
        </div>
      </article>)}
    </div>
    {(view === "products" ? products : stories).length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">No {view} found.</p>}
    <Dialog open={Boolean(preview)} onOpenChange={open => { if (!open) setPreviewId(undefined); }}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle>{preview?.title}</DialogTitle><DialogDescription>{preview && s.vendor(preview.vendorId)?.name} · {preview?.isLive ? "Live story" : "Status"}</DialogDescription></DialogHeader>{preview && <><img src={preview.image} alt={preview.title} className="max-h-[55dvh] w-full rounded-md bg-muted object-contain" /><div className="flex flex-wrap items-center gap-2">{liveUrl && <Button asChild variant="outline"><a href={liveUrl} target="_blank" rel="noreferrer">Open live<Radio /></a></Button>}{preview.productId && s.products.some(p => p.id === preview.productId) && <Button asChild variant="outline"><Link to="/products/$id" params={{ id: preview.productId }}>View product<Eye /></Link></Button>}<RemovePostButton kind="story" id={preview.id} title={preview.title} /></div></>}</DialogContent></Dialog>
  </>;
}

function StoreLink({ id, name }: { id: string; name: string | undefined }) {
  return <Link to="/vendors/$id" params={{ id }} className="flex items-start gap-1.5 text-sm text-muted-foreground"><Store className="mt-0.5 size-4 shrink-0" /><span className="break-words">{name ?? "View store"}</span></Link>;
}