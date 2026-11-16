import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Plus, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { money } from "@/lib/data";
import { groupStoriesByVendor, isStoryLive, safeLiveUrl, storiesForVendor, storyAfterTap, storyTimeLeft } from "@/lib/stories";
import { HorizontalBrowse } from "@/components/market/HorizontalBrowse";
import { STORY_PLAYBACK_MS, useStoryPlayback } from "@/hooks/use-story-playback";

export function DealStories({ vendorId }: { vendorId?: string } = {}) {
  const s = useStore();
  const [selected, setSelected] = useState<string | null>(null);
  const available = s.stories.filter((story) => s.vendor(story.vendorId));
  const groups = groupStoriesByVendor(vendorId ? storiesForVendor(available, vendorId) : available);
  const stories = groups.flatMap((group) => group.stories);
  const index = stories.findIndex((story) => story.id === selected);
  const story = stories[index];
  const vendor = story ? s.vendor(story.vendorId) : undefined;
  const product = story?.productId ? s.product(story.productId) : undefined;
  const live = story ? isStoryLive(story) : false;
  const liveUrl = live ? safeLiveUrl(story?.liveUrl ?? "") : undefined;
  const currentGroup = groups.find((group) => group.vendorId === story?.vendorId);
  const groupIndex = currentGroup?.stories.findIndex((item) => item.id === story?.id) ?? 0;
  const elapsed = useStoryPlayback(story?.id, () => setSelected(storyAfterTap(stories, index, "right")));

  if (vendorId && stories.length === 0) return null;

  return <section aria-label="Deal stories" className="mb-7">
    <HorizontalBrowse label="stories and deals">
      {groups.map((group) => {
        const item = group.stories[0];
        if (!item) return null;
        const seller = s.vendor(item.vendorId);
        const active = isStoryLive(item);
        return <Button key={group.vendorId} variant="ghost" onClick={() => setSelected(item.id)} aria-label={`View statuses: ${seller?.name} — ${group.stories.length} updates${active ? " — LIVE" : ""}`} className="relative h-[120px] w-[110px] shrink-0 overflow-hidden rounded-lg p-0 text-left md:h-[140px] md:w-[130px]">
          <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <span className="story-shade absolute inset-0" />
          <span className="absolute left-2 top-2 size-9 rounded-full border-[3px] border-primary bg-card p-0.5"><img src={seller?.logo} alt="" className="h-full w-full rounded-full object-cover" /></span>
          {active && <span className="absolute right-2 top-2 flex items-center gap-1 rounded-sm bg-destructive px-1.5 py-1 text-[10px] font-bold text-destructive-foreground"><Radio className="size-3" />LIVE</span>}
          {group.stories.length > 1 && <span className="absolute right-2 top-12 rounded-sm bg-navy/70 px-1.5 py-0.5 text-[10px] font-semibold text-navy-foreground">{group.stories.length}</span>}
          <span className="absolute bottom-2 left-2 right-10 line-clamp-2 whitespace-normal text-xs font-bold text-navy-foreground">{seller?.name}</span>
          <span className="absolute bottom-2 right-2 rounded-sm bg-navy/70 px-1 py-0.5 text-[9px] font-semibold text-navy-foreground">{storyTimeLeft(item)}</span>
        </Button>;
      })}
      {!vendorId && <Button asChild size="icon" variant="outline" className="size-10 shrink-0 rounded-full"><Link to={s.role === "vendor" ? "/dashboard" : "/become-vendor"} aria-label="Add story" title="Add story"><Plus /></Link></Button>}
      {stories.length === 0 && <p className="py-4 text-sm text-muted-foreground">No deal stories yet.</p>}
    </HorizontalBrowse>
    <Dialog open={Boolean(story)} onOpenChange={(open) => { if (!open) setSelected(null); }}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-sm overflow-y-auto rounded-lg p-0">
        {story && <>
          <div className="relative h-[min(48dvh,420px)] overflow-hidden rounded-t-lg bg-muted">
            <img src={story.image} alt={story.title} className="h-full w-full object-contain" />
            <div className="pointer-events-none absolute inset-x-3 top-1 flex gap-1" aria-label={`Status ${groupIndex + 1} of ${currentGroup?.stories.length ?? 1}`}>
              {currentGroup?.stories.map((item, i) => <span key={item.id} className="h-1 min-w-0 flex-1 overflow-hidden rounded-sm bg-card/70"><span role={i === groupIndex ? "progressbar" : undefined} aria-label={i === groupIndex ? "Story playback" : undefined} aria-valuemin={i === groupIndex ? 0 : undefined} aria-valuemax={i === groupIndex ? 20 : undefined} aria-valuenow={i === groupIndex ? Math.floor(elapsed / 1000) : undefined} className="block h-full origin-left bg-primary motion-safe:transition-transform motion-safe:duration-100 motion-safe:ease-linear" style={{ transform: `scaleX(${i < groupIndex ? 1 : i === groupIndex ? elapsed / STORY_PLAYBACK_MS : 0})` }} /></span>)}
            </div>
            <div className="pointer-events-none absolute left-3 top-3 flex max-w-[75%] items-center gap-2 rounded-md bg-card/95 p-2"><img src={vendor?.logo} alt="" className="size-8 rounded-full object-cover" /><span className="truncate text-xs font-bold">{vendor?.name}</span>{live && <span className="rounded-sm bg-destructive px-1.5 py-1 text-[10px] font-bold text-destructive-foreground">LIVE</span>}</div>
            <Button variant="ghost" className="absolute inset-y-0 left-0 h-full w-1/2 rounded-none bg-transparent p-0 hover:bg-transparent active:bg-transparent" aria-label="Previous story" onClick={() => setSelected(storyAfterTap(stories, index, "left"))} />
            <Button variant="ghost" className="absolute inset-y-0 right-0 h-full w-1/2 rounded-none bg-transparent p-0 hover:bg-transparent active:bg-transparent" aria-label="Next story" onClick={() => setSelected(storyAfterTap(stories, index, "right"))} />
          </div>
          <div className="space-y-3 p-4 pt-0">
            <DialogTitle className="leading-snug">{story.title}</DialogTitle>
            <DialogDescription>{vendor?.name}{product ? ` · ${money(product.price)}` : ""} · Disappears in {storyTimeLeft(story).replace(" left", "")}</DialogDescription>
            {liveUrl && <Button asChild variant="destructive" className="w-full"><a href={liveUrl} target="_blank" rel="noopener noreferrer"><Radio />Watch live<ExternalLink /></a></Button>}
            <Button asChild variant={live ? "outline" : "default"} className="w-full">{product ? <Link to="/products/$id" params={{ id: product.id }} onClick={() => setSelected(null)}>Shop this deal</Link> : <Link to="/vendors/$id" params={{ id: story.vendorId }} onClick={() => setSelected(null)}>Visit store</Link>}</Button>
          </div>
        </>}
      </DialogContent>
    </Dialog>
  </section>;
}