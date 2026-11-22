import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export function ChatWithSeller({ vendorId, productId, productTitle }: { vendorId: string; productId: string; productTitle: string }) {
  const auth = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  if (auth.role === "vendor" && auth.vendorId === vendorId) return null;
  const open = async () => {
    if (!auth.user) { void nav({ to: "/auth", search: { next: `/products/${productId}` } }); return; }
    setBusy(true);
    const found = await supabase.from("chat_threads").select("id").eq("buyer_id", auth.user.id).eq("vendor_id", vendorId).maybeSingle();
    let id = found.data?.id;
    if (!id) {
      const made = await supabase.from("chat_threads").insert({ buyer_id: auth.user.id, vendor_id: vendorId, product_id: productId, product_title: productTitle }).select("id").single();
      id = made.data?.id;
    }
    setBusy(false);
    if (!id) { toast.error("Could not open the chat. Please try again."); return; }
    void nav({ to: "/messages", search: { t: id } });
  };
  return <Button type="button" variant="outline" size="lg" disabled={busy} onClick={() => void open()} className="w-full gap-2"><MessageCircle className="h-4 w-4" />Chat with seller</Button>;
}
