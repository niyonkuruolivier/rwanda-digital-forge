import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth`, extraParams: { prompt: "select_account" } });
      if (result.error) { setError(result.error.message || "Google sign-in could not finish."); return; }
      if (!result.redirected) await auth.refresh();
    } catch { setError("Google sign-in could not finish. Please try again."); }
    finally { setBusy(false); }
  }

  return <Dialog open={open} onOpenChange={value => { if (!value && !busy) setDismissed(true); }}>
    <DialogContent className="sm:max-w-sm">
      <div className="mx-auto rounded-md bg-card p-2"><img src={logo.url} alt="MURANDASI.COM" width={1920} height={640} className="h-auto w-48" /></div>
      <DialogHeader className="text-center sm:text-center"><DialogTitle>Welcome to Murandasi Market</DialogTitle><DialogDescription>Sign in to your account</DialogDescription></DialogHeader>
      <Button variant="outline" className="google-sign-in h-11 w-full gap-2.5 px-3 text-sm font-medium" disabled={busy} onClick={google}>
        <svg aria-hidden="true" className="size-[18px] shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>{busy ? "Signing in…" : "Continue with Google"}
      </Button>
      <Button asChild variant="outline" disabled={busy}><Link to="/auth" search={{ next: "/account" }} onClick={() => setDismissed(true)}>Sign in with email</Link></Button>
      <Button variant="ghost" disabled={busy} onClick={() => setDismissed(true)}>Continue as guest</Button>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </DialogContent>
  </Dialog>;
}