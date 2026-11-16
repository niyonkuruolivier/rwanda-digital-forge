import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { compressPhoto } from "@/lib/photo";
import type { Certificate } from "@/lib/vendor-agreement";

export function CertificateUpload({ value, onChange, onBusyChange }: { value?: Certificate | undefined; onChange: (value: Certificate) => void; onBusyChange: (busy: boolean) => void }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return <div className="space-y-2"><Label htmlFor="rdb-certificate">RDB certificate (required)</Label><Input id="rdb-certificate" type="file" accept="application/pdf,image/*" disabled={busy} onChange={async (e) => {
    const file = e.target.files?.[0]; e.target.value = ""; if (!file) return;
    setBusy(true); onBusyChange(true); setError("");
    try {
      if (file.type.startsWith("image/")) { const data = await compressPhoto(file); onChange({ name: `${file.name.replace(/\.[^.]+$/, "")}.jpg`, data, mime: "image/jpeg" }); }
      else {
        if (file.type !== "application/pdf" || file.size > 300000) throw new Error("Choose a certificate photo or a PDF under 300 KB for this demo.");
        const bytes = new Uint8Array(await file.arrayBuffer());
        if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") throw new Error("Choose a valid PDF certificate.");
        let text = ""; for (const byte of bytes) text += String.fromCharCode(byte);
        onChange({ name: file.name, data: `data:application/pdf;base64,${btoa(text)}`, mime: file.type });
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Choose another certificate."); }
    finally { setBusy(false); onBusyChange(false); }
  }} /><p className="text-xs text-muted-foreground">Certificate photo compressed below 30 KB, or PDF up to 300 KB (demo limit).</p>{value && <p className="break-all text-sm text-primary">Attached: {value.name}</p>}{busy && <p role="status" className="text-sm">Preparing certificate…</p>}{error && <p role="alert" className="text-sm text-destructive">{error}</p>}</div>;
}