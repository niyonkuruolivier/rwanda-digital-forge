import type { ReactNode } from "react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldBan, LoaderCircle, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { VendorAppeals } from "./VendorAppeals";
import { toast } from "sonner";
import logo from "@/assets/murandasi-logo.png.asset.json";

export function VendorAccessGate({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const store = useStore();
  const queryClient = useQueryClient();
  const [signingOut, setSigningOut] = useState(false);
  if (auth.ready && !auth.error && !store.accountAccessError && !store.accountAccessPending && !store.accountRestricted) return children;
  const restricted = store.accountRestricted;
  const suspended = store.accountRestriction?.status === "Suspended";
  return <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-12">
    <section className="w-full max-w-lg text-center" aria-live="polite">
      <img src={logo.url} alt="MURANDASI.COM" className="mx-auto mb-8 h-auto w-56 max-w-full object-contain" width={1920} height={640} />
      {restricted ? <ShieldBan className="mx-auto mb-6 size-14 text-destructive" /> : <LoaderCircle className="mx-auto mb-6 size-10 animate-spin text-primary motion-reduce:animate-none" />}
      <h1 className="text-2xl font-bold text-heading">{restricted ? suspended ? "You’re suspended" : "You’re blocked" : auth.error || store.accountAccessError ? "Account access unavailable" : "Checking your account…"}</h1>
      {restricted && <>
        <p className="mt-4 text-sm text-muted-foreground">You cannot use Murandasi Market while your account is {suspended ? "suspended" : "blocked"}.</p>
        <p className="mt-6 break-words text-base"><strong>Reason: </strong>{store.accountRestriction?.blockedReason || "Contact the administrator for details."}</p>
        {suspended && store.accountRestriction?.suspendedUntil && <p className="mt-4 text-sm">Suspended until <strong>{new Date(store.accountRestriction.suspendedUntil).toLocaleString("en-GB", { timeZone: "Africa/Kigali" })} (Kigali)</strong>.</p>}
        <p className="mt-4 text-sm text-muted-foreground">{suspended ? "Access returns when the suspension ends or the administrator restores it." : "Access returns when the administrator unblocks your account."} Your records are kept.</p>
      </>}
      {(auth.error || store.accountAccessError) && !restricted && <p className="mt-4 text-sm text-muted-foreground">We could not confirm your account access. Please try again.</p>}
      {restricted && <VendorAppeals />}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button variant="outline" onClick={() => window.location.reload()}>Check again</Button>
        {auth.user && <Button disabled={signingOut} onClick={async () => {
          setSigningOut(true);
          try {
            await queryClient.cancelQueries(); queryClient.clear();
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            await auth.refresh(); window.location.assign("/auth");
          } catch { toast.error("Could not sign out. Try again."); setSigningOut(false); }
        }}><LogOut />{signingOut ? "Signing out…" : "Sign out"}</Button>}
      </div>
    </section>
  </main>;
}