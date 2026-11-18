import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import logo from "@/assets/murandasi-logo.png.asset.json";

export function WelcomeSignIn() {
  const auth = useAuth();
  const location = useLocation();
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const open = auth.ready && !auth.user && !dismissed && location.pathname !== "/auth" && location.pathname !== "/reset-password";

  async function google() {
    if (busy) return;
    setBusy(true); setError("");
    sessionStorage.setItem("murandasi-return", "/account");
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth` });
      if (result.error) { setError(result.error.message || "Google sign-in could not finish."); return; }
      if (!result.redirected) await auth.refresh();
    } catch { setError("Google sign-in could not finish. Please try again."); }
    finally { setBusy(false); }
  }

  if (!open) return null;
  return <aside aria-label="Google sign-in" className="fixed right-3 top-24 z-50 w-[17.5rem] max-w-[calc(100%-1.5rem)] rounded-lg border bg-card p-2.5 text-card-foreground shadow-lg sm:right-5 sm:top-28 sm:w-80 sm:p-4">
      <div className="mb-1 flex items-center justify-between gap-3 sm:mb-3"><img src={logo.url} alt="MURANDASI.COM" width={1920} height={640} className="h-auto w-24 sm:w-36" /><Button variant="ghost" size="icon" className="size-8 shrink-0" aria-label="Dismiss sign-in prompt" title="Dismiss" disabled={busy} onClick={() => setDismissed(true)}><X className="size-4" /></Button></div>
      <h2 className="mb-3 hidden text-sm font-semibold sm:block">Sign in</h2>
      <Button variant="outline" className="google-sign-in h-10 w-full gap-2.5 px-3 text-sm font-medium sm:h-11" disabled={busy} onClick={google}>
        <svg aria-hidden="true" className="size-[18px] shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>{busy ? "Signing in…" : "Continue with Google"}
      </Button>
      <Button asChild variant="link" size="sm" className="mt-1 h-6 px-0 text-xs sm:h-8 sm:text-sm" disabled={busy}><Link to="/auth" search={{ next: "/account" }} onClick={() => setDismissed(true)}>Other sign-in options</Link></Button>
      {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
  </aside>;
}