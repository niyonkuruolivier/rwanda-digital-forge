import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStore } from "@/lib/store";

export function RemovePostButton({ kind, id, title }: { kind: "product" | "story"; id: string; title: string }) {
  const { removeUserPost } = useStore();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  return <><Button size="icon" variant="outline" className="shrink-0 text-destructive" title="Delete post" aria-label={`Delete ${title}`} onClick={() => setOpen(true)}><Trash2 className="size-4" /></Button>
    <Dialog open={open} onOpenChange={(value) => { if (!busy) setOpen(value); }}><DialogContent><DialogHeader><DialogTitle>Delete this post?</DialogTitle><DialogDescription>{title} will disappear from the marketplace and the vendor dashboard. The vendor cannot restore it. Existing purchase and payment records are kept.</DialogDescription></DialogHeader><div className="flex justify-end gap-2"><Button variant="outline" disabled={busy} onClick={() => setOpen(false)}>Cancel</Button><Button variant="destructive" disabled={busy} onClick={async () => { setBusy(true); try { await removeUserPost(kind, id); toast.success("Post deleted"); setOpen(false); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not delete post."); } finally { setBusy(false); } }}>{busy ? "Deleting…" : "Delete post"}</Button></div></DialogContent></Dialog>
  </>;
}