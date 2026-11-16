import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogIn, UserPlus, Mail, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth";
import { safeAccountReturn } from "@/lib/account-access";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({ next: safeAccountReturn(search['next']) }),
  head: () => ({ meta: [{ title: "Sign in — Murandasi Market" }, { name: "description", content: "Sign in securely to your customer, seller or administrator account." }, { property: "og:title", content: "Sign in — Murandasi Market" }, { property: "og:description", content: "Access your own Murandasi Market account." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: SignIn,
});
function SignIn() {
  const auth = useAuth(); const navigate = useNavigate(); const { next } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => {
    if (!auth.ready || !auth.user || !auth.profile) return;
    const stored = sessionStorage.getItem("murandasi-return");
    sessionStorage.removeItem("murandasi-return");
    const target = safeAccountReturn(stored ?? next);
    void navigate({ to: target === "/account" ? auth.role === "admin" ? "/admin" : auth.role === "vendor" ? "/dashboard" : "/account" : target, replace: true });
  }, [auth.ready, auth.user, auth.profile, auth.role, next, navigate]);
  async function google() {
    setError(""); setBusy(true);
    sessionStorage.setItem("murandasi-return", next);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth`, extraParams: { prompt: "select_account" } });
      if (result.error) { setError(result.error.message || "Google sign-in could not finish."); return; }
      if (!result.redirected) await auth.refresh();
    } catch { setError("Google sign-in could not finish. Please try again."); }
    finally { setBusy(false); }
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const f = new FormData(event.currentTarget);
    const email = String(f.get("email")).trim(); const password = String(f.get("password"));
    if (mode === "signup" && password !== String(f.get("confirmPassword"))) { setError("Passwords do not match."); return; }
    setBusy(true); setError("");
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: String(f.get("name")).trim() }, emailRedirectTo: `${window.location.origin}/auth?next=${encodeURIComponent(next)}` } });
        if (error) { setError(error.message); return; }
        if (!data.session) { setConfirmation(true); return; }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setError("Email or password is incorrect."); return; }
      }
      await auth.refresh();
    } catch { setError("Could not finish. Please try again."); }
    finally { setBusy(false); }
  }
  if (confirmation) return <div className="mx-auto max-w-md px-4 py-10 sm:py-12"><Mail className="mb-4 size-8 text-primary" /><h1 className="text-2xl font-extrabold text-heading">Check your email</h1><p role="status" className="mt-4 text-sm text-muted-foreground">Confirm your email address using the link we sent before signing in.</p><Button className="mt-6" variant="outline" onClick={() => { setConfirmation(false); setMode("signin"); setError(""); }}>Back to sign in</Button></div>;
  return <div className="mx-auto max-w-md px-4 pt-6 pb-24 sm:pt-10 md:pb-10">
    <h1 className="text-2xl font-extrabold text-heading">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
    <div className="mb-5 mt-4 grid grid-cols-2 border-b" role="tablist" aria-label="Sign-in options">{(["signin", "signup"] as const).map((value) => <Button key={value} role="tab" aria-selected={mode === value} disabled={busy} variant="ghost" className={`rounded-none ${mode === value ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`} onClick={() => { setMode(value); setError(""); setShowPassword(false); }}>{value === "signin" ? "Sign in" : "Sign up"}</Button>)}</div>
    <Button onClick={google} disabled={busy} variant="outline" className="google-sign-in h-11 w-full gap-2.5 px-3 text-sm font-medium">
      <svg aria-hidden="true" className="size-[18px] shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>{busy ? "Signing in…" : "Sign in with Google"}
    </Button>
    <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
    <form key={mode} className="space-y-3" onSubmit={submit}>
      {mode === "signup" && <div className="space-y-1.5"><Label htmlFor="login-name">Full name</Label><Input id="login-name" name="name" autoComplete="name" required disabled={busy} /></div>}
      <div className="space-y-1.5"><Label htmlFor="login-email">Email</Label><Input id="login-email" name="email" type="email" autoComplete={mode === "signup" ? "email" : "username"} required disabled={busy} /></div>
      <div className="space-y-1.5"><Label htmlFor="login-password">Password</Label><div className="relative"><Input id="login-password" name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} required disabled={busy} className="pr-11" /><Button type="button" size="icon" variant="ghost" className="absolute right-0 top-0 size-10" aria-label={showPassword ? "Hide password" : "Show password"} title={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff /> : <Eye />}</Button></div></div>
      {mode === "signup" && <div className="space-y-1.5"><Label htmlFor="login-confirm">Confirm password</Label><Input id="login-confirm" name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" required disabled={busy} /></div>}
      <Button type="submit" className="h-11 w-full" disabled={busy}>{mode === "signin" ? <LogIn /> : <UserPlus />}{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</Button>
    </form>
    {(error || auth.error) && <p role="alert" className="mt-4 text-sm text-destructive">{error || auth.error}</p>}
  </div>;
}