import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type Product, type ProductOption } from "@/lib/data";
import { useStore } from "@/lib/store";
import { requireProductCategory } from "@/lib/categories";
import { PhotoUpload } from "./PhotoUpload";
import { ArrowLeft, ArrowRight, ImageIcon, Trash2 } from "lucide-react";
import { detectProductVideo, moveProductPhoto, productVideoSchema } from "@/lib/product-media";

export function ProductForm({ open, onOpenChange, initial, vendorId, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; initial?: Product | undefined; vendorId: string; onSave: (p: Product) => Promise<void> }) {
  const { categories } = useStore();
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [videoLinkValue, setVideoLinkValue] = useState(initial?.videoUrl ?? "");
  const [regular, setRegular] = useState(String(initial?.compareAt ?? initial?.price ?? ""));
  const [discount, setDiscount] = useState(String(initial?.compareAt && initial.compareAt > initial.price ? Math.round((1 - initial.price / initial.compareAt) * 100) : ""));
  const regularNum = Number(regular) || 0;
  const discountNum = Math.min(90, Math.max(0, Math.round(Number(discount) || 0)));
  const finalPrice = Math.round(regularNum * (1 - discountNum / 100));
  const detected = detectProductVideo(videoLinkValue);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (loading || saving) return;
    if (!images.length) { setError("Choose a product photo."); return; }
    const videoLink = String(f.get("videoUrl") ?? "").trim();
    const video = videoLink ? productVideoSchema.safeParse(videoLink) : undefined;
    if (video && !video.success) { setError("Paste a YouTube, Instagram post/Reel, or full TikTok video link."); return; }
    let category: string;
    try { category = requireProductCategory(f.get("category"), categories); } catch { setError("Choose one category for this product."); return; }
    const list = (key: string) => String(f.get(key) ?? "").split(",").map((x) => x.trim()).filter(Boolean);
    const options: ProductOption[] = ([["Size", list("sizes")], ["Color", list("colors")]] as const)
      .filter(([, values]) => values.length > 0)
      .map(([name, values]) => ({ name, values }));
    if (Number(discount) < 0 || Number(discount) > 90) { setError("Discount must be between 0% and 90%."); return; }
    setSaving(true);
    try { await onSave({
      id: initial?.id ?? "p" + Date.now(), vendorId, title: String(f.get("title")), category,
      price: finalPrice, stock: Number(f.get("stock")), description: String(f.get("description")),
      images, rating: initial?.rating ?? 0, reviews: initial?.reviews ?? [], compareAt: discountNum > 0 ? regularNum : undefined,
      ...(video?.success ? { videoUrl: video.data } : {}),
      ...(options.length ? { options } : {}),
    });
    onOpenChange(false); } catch (error) { setError(error instanceof Error ? error.message : "Could not publish product."); } finally { setSaving(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader><DialogTitle>{initial ? "Edit product" : "Add new product"}</DialogTitle></DialogHeader>
        <form key={initial?.id ?? "new"} onSubmit={submit} className="space-y-3">
          <div><Label htmlFor="title">Product title</Label><Input id="title" name="title" defaultValue={initial?.title} required /></div>
          <div><Label htmlFor="category">Category *</Label><select id="category" name="category" required defaultValue={initial?.category ?? ""} className="h-10 w-full rounded-md border bg-card px-2 text-sm"><option value="" disabled>Choose one category</option>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="price">Price (RWF)</Label><Input id="price" name="price" type="number" step="1" min="0" value={regular} onChange={(e) => setRegular(e.target.value)} required /></div>
            <div><Label htmlFor="stock">Stock</Label><Input id="stock" name="stock" type="number" min="0" defaultValue={initial?.stock} required /></div>
          </div>
          <div className="rounded-lg border bg-muted/40 p-3">
            <Label htmlFor="discount">Discount % (optional)</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              <Input id="discount" name="discount" type="number" min="0" max="90" step="1" placeholder="0" className="w-24" value={discount} onChange={(e) => setDiscount(e.target.value)} />
              {[0, 10, 20, 30, 50].map((d) => <Button key={d} type="button" size="sm" variant={discountNum === d ? "default" : "outline"} onClick={() => setDiscount(d ? String(d) : "")}>{d ? `${d}%` : "None"}</Button>)}
            </div>
            {discountNum > 0 && regularNum > 0 && <p role="status" className="mt-2 text-sm">Buyers pay <span className="font-bold text-primary">RWF {finalPrice.toLocaleString()}</span> <span className="text-muted-foreground line-through">RWF {regularNum.toLocaleString()}</span> · {discountNum}% off</p>}
          </div>
          <PhotoUpload id="file" label="Add product photos" value="" onChange={(value) => setImages((current) => [...current, value])} onPhotosChange={(values) => { setImages((current) => [...current, ...values]); setError(""); }} onBusyChange={setLoading} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((src, index) => <div key={index} className="min-w-0 space-y-1">
              <img src={src} alt={`Product photo ${index + 1}`} className="aspect-square w-full rounded-md border bg-muted object-cover" />
              <p className="text-xs font-medium">{index === 0 ? "1 · Cover photo" : `${index + 1} · Photo`}</p>
              <div className="flex flex-wrap gap-1">
                <Button type="button" size="icon" variant="outline" className="h-8 w-8" disabled={index === 0 || loading || saving} title="Make cover photo" aria-label={`Make photo ${index + 1} the cover`} onClick={() => setImages((current) => moveProductPhoto(current, index, 0))}><ImageIcon className="h-3.5 w-3.5" /></Button>
                <Button type="button" size="icon" variant="outline" className="h-8 w-8" disabled={index === 0 || loading || saving} title="Move earlier" aria-label={`Move photo ${index + 1} earlier`} onClick={() => setImages((current) => moveProductPhoto(current, index, index - 1))}><ArrowLeft className="h-3.5 w-3.5" /></Button>
                <Button type="button" size="icon" variant="outline" className="h-8 w-8" disabled={index === images.length - 1 || loading || saving} title="Move later" aria-label={`Move photo ${index + 1} later`} onClick={() => setImages((current) => moveProductPhoto(current, index, index + 1))}><ArrowRight className="h-3.5 w-3.5" /></Button>
                <Button type="button" size="icon" variant="outline" className="h-8 w-8 text-destructive" disabled={loading || saving} title="Remove photo" aria-label={`Remove photo ${index + 1}`} onClick={() => setImages((current) => current.filter((_, i) => i !== index))}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>)}
          </div>
          <div><Label htmlFor="description">Description</Label><Textarea id="description" name="description" defaultValue={initial?.description} rows={3} required /></div>
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-sm font-semibold text-heading">Choices for buyers (optional)</p>
            <p className="text-xs text-muted-foreground">Buyers must pick one of these before they can buy. Separate values with commas.</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <div><Label htmlFor="sizes">Available sizes</Label><Input id="sizes" name="sizes" placeholder="S, M, L, XL" defaultValue={initial?.options?.find((o) => o.name === "Size")?.values.join(", ")} /></div>
              <div><Label htmlFor="colors">Available colors</Label><Input id="colors" name="colors" placeholder="Black, White" defaultValue={initial?.options?.find((o) => o.name === "Color")?.values.join(", ")} /></div>
            </div>
          </div>
          <div className="space-y-1"><Label htmlFor="videoUrl">Video link (optional)</Label><Input id="videoUrl" name="videoUrl" type="url" placeholder="YouTube, Instagram or TikTok link" value={videoLinkValue} onChange={(event) => setVideoLinkValue(event.target.value)} />{detected && <p role="status" className="text-xs font-medium text-primary">{detected.platform}</p>}</div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading || saving} className="w-full">{saving ? "Publishing…" : initial ? "Save changes" : "Publish product"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
