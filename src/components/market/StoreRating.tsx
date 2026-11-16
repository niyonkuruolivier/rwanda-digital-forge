import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { rateStore } from "@/lib/store-ratings.functions";
import { Stars } from "./Stars";
export function StoreRating({ vendorId }: { vendorId: string }) {
  const auth = useAuth();
  const { vendor, ratingsPending, ratingsError } = useStore();
  const store = vendor(vendorId);
  const cache = useQueryClient();
  const save = useServerFn(rateStore);
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const own = useQuery({ queryKey: ["own-store-rating", auth.user?.id, vendorId], enabled: Boolean(auth.user), queryFn: async () => {
    if (!auth.user) return 0;
    const result = await supabase.from("store_ratings").select("stars").eq("user_id", auth.user.id).eq("vendor_id", vendorId).maybeSingle();
    if (result.error) throw result.error;
    return result.data?.stars ?? 0;
  } });
  return <div className="flex flex-wrap items-center gap-2"><span className="flex items-center gap-1" aria-live="polite"><Stars value={store?.rating ?? 0} />{ratingsPending ? "…" : ratingsError ? "Unavailable" : store?.ratingCount ? `${store.rating.toFixed(1)} (${store.ratingCount} ${store.ratingCount === 1 ? "rating" : "ratings"})` : "No ratings yet"}</span>
    {auth.vendorId !== vendorId && <Dialog open={open} onOpenChange={(value) => { setOpen(value); setSelection(own.data ?? 0); setError(""); }}><DialogTrigger asChild><Button variant="link" size="sm" className="h-auto px-0 py-1">{own.data ? "Change rating" : "Rate store"}</Button></DialogTrigger><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Rate {store?.name ?? "this store"}</DialogTitle></DialogHeader>
      {auth.user ? <><div className="flex justify-center gap-2" role="group" aria-label="Choose your star rating">{[1,2,3,4,5].map((stars) => <Button key={stars} type="button" size="icon" variant="ghost" aria-label={`${stars} ${stars === 1 ? "star" : "stars"}`} aria-pressed={selection === stars} onClick={() => setSelection(stars)} disabled={saving || own.isPending || own.isError}><Star className={`size-7 ${stars <= selection ? "fill-star text-star" : "text-muted-foreground"}`} /></Button>)}</div>{(error || own.isError) && <p role="alert" className="text-sm text-destructive">{error || "Could not load your rating. Please try again."}</p>}<Button disabled={!selection || saving || own.isPending || own.isError} onClick={async () => { setSaving(true); setError(""); try { await save({ data: { vendorId, stars: selection } }); await Promise.all([cache.invalidateQueries({ queryKey: ["store-ratings"] }), own.refetch()]); setOpen(false); } catch(e) { setError(e instanceof Error ? e.message : "Could not save rating."); } finally { setSaving(false); } }}>{saving ? "Saving…" : "Save rating"}</Button></> : <Button asChild><Link to="/auth" search={{ next: `/vendors/${vendorId}` }}>Sign in to rate</Link></Button>}
    </DialogContent></Dialog>}
  </div>;
}
