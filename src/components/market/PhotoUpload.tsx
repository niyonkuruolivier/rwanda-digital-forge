import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { compressPhoto } from "@/lib/photo";

export function PhotoUpload({ id, label, value, onChange, onBusyChange, onPhotosChange }: {
  id: string; label: string; value: string; onChange: (value: string) => void; onBusyChange: (busy: boolean) => void;
  onPhotosChange?: (values: string[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} type="file" accept="image/*" multiple={Boolean(onPhotosChange)} disabled={busy} onChange={async (event) => {
      const files = Array.from(event.target.files ?? []);
      event.target.value = "";
      if (!files.length) return;
      setBusy(true); onBusyChange(true); setError("");
      try {
        const photos: string[] = [];
        for (const file of onPhotosChange ? files : files.slice(0, 1)) photos.push(await compressPhoto(file));
        if (onPhotosChange) onPhotosChange(photos);
        else if (photos[0]) onChange(photos[0]);
      }
      catch (error) { setError(error instanceof Error ? error.message : "Choose another photo."); }
      finally { setBusy(false); onBusyChange(false); }
    }} />
    {busy && <p role="status" className="text-sm text-muted-foreground">Compressing photo…</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {value && <img src={value} alt={`${label} preview`} className="h-24 w-24 rounded-md bg-muted object-cover" />}
  </div>;
}