import { useState } from "react";
import { Plus, Tags } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { addProductCategory } from "@/lib/catalog.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhotoUpload } from "./PhotoUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImagePlus } from "lucide-react";

export function CategoryManager() {
  const { categories, categoryImages, saveCategoryPicture } = useStore();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [added, setAdded] = useState<string[]>([]);
  const [editing, setEditing] = useState<string>();
  const [photo, setPhoto] = useState("");
  const [busy, setBusy] = useState(false);
  const [pictureSaving, setPictureSaving] = useState(false);
  return <section className="mt-5">
    <form className="flex max-w-lg flex-wrap items-end gap-3" onSubmit={async (event) => {
      event.preventDefault();
      if (saving) return;
      setSaving(true);
      try { const result = await addProductCategory({ data: { name } }); setAdded((p) => [...p, result]); setName(""); toast.success("Category added"); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not add category."); } finally { setSaving(false); }
    }}>
      <div className="min-w-0 flex-1 space-y-2"><Label htmlFor="new-category">Category name</Label><Input id="new-category" placeholder="Furniture" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} required /></div>
      <Button type="submit" disabled={saving || !name.trim()}><Plus />{saving ? "Adding…" : "Add category"}</Button>
    </form>
    <ul className="mt-6 divide-y border-y">{[...new Set([...categories, ...added])].map((category) => <li key={category} className="flex items-center gap-3 py-3">{categoryImages[category] ? <img src={categoryImages[category]} alt={`${category} picture`} className="size-16 shrink-0 rounded-md object-cover" /> : <Tags className="size-16 shrink-0 rounded-md bg-muted p-5 text-primary" />}<span className="min-w-0 flex-1 break-words text-sm font-medium">{category}</span><Button variant="outline" size="icon" title="Change picture" aria-label={`Change ${category} picture`} onClick={() => { setEditing(category); setPhoto(""); }}><ImagePlus /></Button></li>)}</ul>
    <Dialog open={Boolean(editing)} onOpenChange={(open) => { if (!open && !busy && !pictureSaving) setEditing(undefined); }}><DialogContent><DialogHeader><DialogTitle>{editing} picture</DialogTitle></DialogHeader><PhotoUpload id="category-picture" label="Choose category picture" value={photo} onChange={setPhoto} onBusyChange={setBusy} /><Button disabled={!photo || busy || pictureSaving} onClick={async () => { if (!editing) return; setPictureSaving(true); try { await saveCategoryPicture(editing, photo); toast.success("Category picture updated"); setEditing(undefined); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save picture."); } finally { setPictureSaving(false); } }}>{pictureSaving ? "Saving…" : "Save picture"}</Button></DialogContent></Dialog>
  </section>;
}