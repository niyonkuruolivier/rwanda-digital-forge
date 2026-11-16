import { useState, type FormEvent } from "react";
import { Pencil, Plus, Radio, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/lib/store";
import { isLiveExpired, isStoryLive, type DealStory } from "@/lib/stories";
import { PhotoUpload } from "./PhotoUpload";
import { canVendorTrade } from "@/lib/admin";

function StoryEditor({ initial, onClose }: { initial?: DealStory | undefined; onClose: () => void }) {
  const s = useStore();
  const mine = s.products.filter((p) => p.vendorId === s.myVendorId);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [productId, setProductId] = useState(initial?.productId ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [liveUrl, setLiveUrl] = useState(initial?.liveUrl ?? "");
  const [isLive, setLive] = useState(initial?.isLive ?? false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (loading || saving) return;
    setSaving(true);
    const error = await s.saveStory({ id: initial?.id ?? crypto.randomUUID(), vendorId: s.myVendorId, title: title.trim(), image, productId: productId || undefined, isLive, liveUrl: liveUrl.trim() || undefined, createdAt: initial?.createdAt ?? Date.now(), liveSince: isLive ? (initial?.isLive && initial.liveSince ? initial.liveSince : Date.now()) : undefined });
    setSaving(false);
    if (error) { setError(error); return; }
    toast.success("Story published"); onClose();
  }
  return <form onSubmit={submit} className="space-y-4">
    <div className="space-y-2"><Label htmlFor="story-title">Deal title</Label><Input id="story-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Friday hot deals" maxLength={80} required /></div>
    <div className="space-y-2"><Label htmlFor="story-product">Product (optional)</Label><select id="story-product" className="h-9 w-full rounded-md border bg-card px-3 text-sm" value={productId} onChange={(e) => setProductId(e.target.value)}><option value="">Store story</option>{mine.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select></div>
    <PhotoUpload id="story-photo" label="Story photo" value={image} onChange={setImage} onBusyChange={setLoading} />
    <div className="flex items-center justify-between gap-3"><Label htmlFor="story-live">I’m live now</Label><Switch id="story-live" checked={isLive} onCheckedChange={setLive} /></div>
    <div className="space-y-2"><Label htmlFor="story-link">TikTok or other live-video link</Label><Input id="story-link" type="url" placeholder="https://www.tiktok.com/@yourstore/live" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} required={isLive} /></div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Button type="submit" disabled={loading || saving} className="w-full">{saving ? "Publishing…" : loading ? "Loading photo…" : "Publish story"}</Button>
  </form>;
}

export function StoryDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (open: boolean) => void; editing?: DealStory | undefined }) {
  const s = useStore();
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg"><DialogHeader><DialogTitle>{editing ? "Edit story" : "New deal story"}</DialogTitle><DialogDescription>{s.vendor(s.myVendorId)?.name}</DialogDescription></DialogHeader>{open && <StoryEditor key={editing?.id ?? "new"} initial={editing} onClose={() => onOpenChange(false)} />}</DialogContent></Dialog>;
}

export function StoryManager() {
  const s = useStore();
  const restricted = !canVendorTrade(s.vendor(s.myVendorId));
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DealStory | undefined>();
  const stories = s.stories.filter((story) => story.vendorId === s.myVendorId);
  const save = async (story: DealStory, message: string) => { const error = await s.saveStory(story); if (error) toast.error(error); else toast.success(message); };
  return <div>
    <div className="my-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">Your deal stories</h2><Button disabled={restricted} onClick={() => { setEditing(undefined); setOpen(true); }}><Plus />Add story</Button></div>
    <div className="grid gap-3 md:grid-cols-2">{stories.map((story) => <div key={story.id} className="flex min-w-0 items-center gap-3 rounded-lg border bg-card p-3"><img src={story.image} alt="" className="h-20 w-14 shrink-0 rounded-md object-cover" /><div className="min-w-0 flex-1"><h3 className="line-clamp-2 text-sm font-bold">{story.title}</h3>{isStoryLive(story) && <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-destructive"><Radio className="size-3" />LIVE · shows for 3h</span>}{isLiveExpired(story) && <span className="mt-1 block text-xs text-muted-foreground">Live hidden after 3 hours</span>}<div className="mt-2 flex flex-wrap gap-1"><Button variant="ghost" size="icon" aria-label={`Edit story ${story.title}`} onClick={() => { setEditing(story); setOpen(true); }}><Pencil /></Button>{isStoryLive(story) && <Button variant="outline" size="sm" onClick={() => { void save({ ...story, isLive: false }, "Live badge removed"); }}>End live</Button>}{isLiveExpired(story) && <Button size="sm" variant="destructive" onClick={() => { const now = Date.now(); void save({ ...story, liveSince: now, createdAt: now }, "Back on stories as LIVE for 3 more hours"); }}><Radio />Still live</Button>}<Button variant="ghost" size="icon" aria-label={`Delete story ${story.title}`} onClick={async () => { try { await s.deleteStory(story.id); toast.success("Story removed"); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not delete story."); } }}><Trash2 className="text-destructive" /></Button></div></div></div>)}</div>
    {stories.length === 0 && <p className="py-8 text-sm text-muted-foreground">No stories published yet.</p>}
    <StoryDialog open={open} onOpenChange={setOpen} editing={editing} />
  </div>;
}