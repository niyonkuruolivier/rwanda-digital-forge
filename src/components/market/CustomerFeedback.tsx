import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { UserRound, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { submitFeedback } from "@/lib/feedback.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PhotoUpload } from "./PhotoUpload";
import type { Review } from "@/lib/data";

export function CustomerFeedback({ targetType, targetId, demo = [] }: { targetType: "product" | "shop"; targetId: string; demo?: Review[] }) {
  const auth = useAuth();
  const [message, setMessage] = useState(""); const [photos, setPhotos] = useState<string[]>([]); const [busy, setBusy] = useState(false); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const query = useQuery({ queryKey: ["feedback", targetType, targetId], queryFn: async () => { const result = await supabase.rpc("public_customer_feedback", { _target_type: targetType, _target_id: targetId }); if (result.error) throw result.error; return result.data; } });
  return <section className="mt-10 border-t py-6">
    <h2 className="text-xl font-bold text-heading">Customer feedback</h2>
    {auth.user ? <form className="mt-4 space-y-3" onSubmit={async (event) => { event.preventDefault(); setSaving(true); setError(""); try { await submitFeedback({ data: { targetType, targetId, message, photos } }); setMessage(""); setPhotos([]); await query.refetch(); } catch { setError("Could not post feedback. Please try again."); } finally { setSaving(false); } }}>
      <Textarea aria-label="Your feedback" placeholder={targetType === "shop" ? "Share your experience with this shop…" : "Share your experience with this product…"} value={message} onChange={(e) => setMessage(e.target.value)} required maxLength={2000} />
      <div className="flex flex-wrap gap-3">{photos.map((photo, index) => <div key={index} className="relative"><img src={photo} alt={`Feedback photo ${index + 1}`} className="size-24 rounded-md object-cover" /><Button type="button" size="icon" variant="outline" className="absolute right-0 top-0 size-7" aria-label={`Remove photo ${index + 1}`} onClick={() => setPhotos((p) => p.filter((_, i) => i !== index))}><X /></Button></div>)}</div>
      {photos.length < 3 && <PhotoUpload id={`feedback-photo-${targetType}-${targetId}`} label={`Add photo (${photos.length}/3)`} value="" onBusyChange={setBusy} onChange={(photo) => setPhotos((p) => p.length < 3 ? [...p, photo] : p)} />}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button disabled={saving || busy || !message.trim()}>{saving ? "Posting…" : "Post feedback"}</Button>
    </form> : <Button asChild variant="outline" className="mt-4"><Link to="/auth" search={{ next: targetType === "product" ? `/products/${targetId}` : `/vendors/${targetId}` }}>Sign in to leave feedback</Link></Button>}
    {query.isPending && <p className="mt-4 text-sm text-muted-foreground">Loading feedback…</p>}{query.isError && <Button variant="outline" className="mt-4" onClick={() => query.refetch()}>Retry feedback</Button>}
    <div className="mt-6 divide-y">{query.data?.map((feedback) => <article key={feedback.id} className="py-5"><div className="flex items-center gap-3">{feedback.author_photo ? <img src={feedback.author_photo} alt={feedback.author_name} className="size-10 rounded-full object-cover" /> : <UserRound className="size-10 rounded-full bg-muted p-2 text-muted-foreground" />}<div><p className="font-semibold">{feedback.author_name}</p><p className="text-xs text-muted-foreground">{new Date(feedback.created_at).toLocaleDateString("en-GB")}</p></div></div><p className="mt-3 whitespace-pre-wrap break-words text-sm">{feedback.message}</p><div className="mt-3 flex flex-wrap gap-2">{Array.isArray(feedback.photos) && feedback.photos.filter((p): p is string => typeof p === "string").map((photo, i) => <a key={i} href={photo} target="_blank" rel="noreferrer"><img src={photo} alt={`Customer feedback photo ${i + 1}`} className="size-24 rounded-md object-cover" /></a>)}</div></article>)}{demo.map((review, i) => <article key={`demo-${i}`} className="py-5"><div className="flex items-center gap-3"><UserRound className="size-10 rounded-full bg-muted p-2 text-muted-foreground" /><div><p className="font-semibold">{review.author}</p><p className="text-xs text-muted-foreground">Demo feedback</p></div></div><p className="mt-3 text-sm">{review.text}</p></article>)}</div>
    {query.data?.length === 0 && demo.length === 0 && <p className="mt-4 text-sm text-muted-foreground">No feedback yet.</p>}
  </section>;
}