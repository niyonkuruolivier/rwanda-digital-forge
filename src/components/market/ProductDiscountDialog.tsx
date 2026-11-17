import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { money, type Product } from "@/lib/data";
import { applyDiscount, discountPercent } from "@/lib/discounts";

export function ProductDiscountDialog({ product, onClose, onSave }: { product: Product; onClose: () => void; onSave: (product: Product) => Promise<void> }) {
  const [percentage, setPercentage] = useState(String(discountPercent(product)));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  let preview: Product | undefined;
  try { preview = applyDiscount(product, Number(percentage)); } catch { /* Validation appears on submission. */ }
  return <Dialog open onOpenChange={(open) => { if (!open && !saving) onClose(); }}>
    <DialogContent className="bg-card">
      <DialogHeader><DialogTitle>Product discount</DialogTitle></DialogHeader>
      <p className="font-semibold text-heading">{product.title}</p>
      <form className="space-y-4" onSubmit={async (event) => {
        event.preventDefault();
        if (saving) return;
        setError(""); setSaving(true);
        try { await onSave(applyDiscount(product, Number(percentage))); onClose(); }
        catch (error) { setError(error instanceof Error ? error.message : "Could not save discount."); }
        finally { setSaving(false); }
      }}>
        <div><Label htmlFor="quick-discount">Discount %</Label><Input id="quick-discount" type="number" min="0" max="90" step="1" required value={percentage} disabled={saving} onChange={(event) => setPercentage(event.target.value)} /></div>
        <div className="flex flex-wrap gap-2">{[0, 10, 20, 30, 50].map(value => <Button key={value} type="button" size="sm" disabled={saving} variant={Number(percentage) === value ? "default" : "outline"} onClick={() => setPercentage(String(value))}>{value ? `${value}%` : "None"}</Button>)}</div>
        {preview && <div role="status"><p className="text-sm text-muted-foreground">Buyers pay</p><p className="text-xl font-bold text-primary">{money(preview.price)}</p>{preview.compareAt && <p className="text-sm text-muted-foreground"><span className="line-through">{money(preview.compareAt)}</span> · {percentage}% off</p>}</div>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={saving} className="w-full">{saving ? "Saving…" : "Save discount"}</Button>
      </form>
    </DialogContent>
  </Dialog>;
}