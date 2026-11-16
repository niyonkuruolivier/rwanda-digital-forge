import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhotoUpload } from "./PhotoUpload";
import type { Vendor } from "@/lib/data";

export type StoreDetails = Pick<Vendor, "name" | "location" | "bio" | "logo" | "banner" | "phone">;

export function StoreProfileEditor({ vendor, open, onOpenChange, onSave }: { vendor: Vendor; open: boolean; onOpenChange: (open: boolean) => void; onSave: (details: StoreDetails) => Promise<void> }) {
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto">
      <DialogHeader><DialogTitle>Edit store profile</DialogTitle><DialogDescription>{vendor.name}</DialogDescription></DialogHeader>
      {open && <StoreForm key={vendor.id} vendor={vendor} onSave={onSave} />}
    </DialogContent>
  </Dialog>;
}

function StoreForm({ vendor, onSave }: { vendor: Vendor; onSave: (details: StoreDetails) => Promise<void> }) {
  const [draft, setDraft] = useState<StoreDetails>({ name: vendor.name, location: vendor.location, bio: vendor.bio, logo: vendor.logo, banner: vendor.banner, phone: vendor.phone ?? "" });
  const [logoBusy, setLogoBusy] = useState(false);
  const [bannerBusy, setBannerBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  return <form className="space-y-4" onSubmit={async (event) => {
    event.preventDefault();
    if (saving || logoBusy || bannerBusy || !draft.name.trim() || !draft.location.trim()) return;
    setSaving(true);
    try { await onSave({ ...draft, name: draft.name.trim(), location: draft.location.trim(), bio: draft.bio.trim() }); } catch (error) { setError(error instanceof Error ? error.message : "Could not save your store."); } finally { setSaving(false); }
  }}>
    <div className="space-y-2"><Label htmlFor="store-name">Store name</Label><Input id="store-name" required value={draft.name} onChange={(event) => setDraft((d) => ({ ...d, name: event.target.value }))} /></div>
    <div className="space-y-2"><Label htmlFor="store-location">Location</Label><Input id="store-location" required value={draft.location} onChange={(event) => setDraft((d) => ({ ...d, location: event.target.value }))} /></div>
    <div className="space-y-2"><Label htmlFor="store-phone">Shop phone number</Label><Input id="store-phone" type="tel" autoComplete="tel" value={draft.phone ?? ""} placeholder="+250 7xx xxx xxx" onChange={(event) => setDraft((d) => ({ ...d, phone: event.target.value }))} /></div>
    <div className="space-y-2"><Label htmlFor="store-bio">Store bio</Label><Textarea id="store-bio" rows={3} value={draft.bio} onChange={(event) => setDraft((d) => ({ ...d, bio: event.target.value }))} /></div>
    <PhotoUpload id="store-profile-photo" label="Store profile photo" value={draft.logo} onChange={(logo) => setDraft((d) => ({ ...d, logo }))} onBusyChange={setLogoBusy} />
    <PhotoUpload id="store-cover-photo" label="Background photo" value={draft.banner} onChange={(banner) => setDraft((d) => ({ ...d, banner }))} onBusyChange={setBannerBusy} />
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Button type="submit" className="w-full" disabled={saving || logoBusy || bannerBusy || !draft.name.trim() || !draft.location.trim()}>{saving ? "Saving…" : "Save changes"}</Button>
  </form>;
}