import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { accountAccess } from "./account-access";
import type { BuyerProfile } from "./buyer";

interface AuthState { user: User | null; profile: BuyerProfile | null; role: "buyer" | "vendor" | "admin"; vendorId: string; ready: boolean; error: string; refresh: () => Promise<void> }
const AuthContext = createContext<AuthState | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<AuthState,"refresh">>({ user: null, profile: null, role: "buyer", vendorId: "", ready: false, error: "" });
  const refresh = useCallback(async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!user || error) { setState({ user: null, profile: null, role: "buyer", vendorId: "", ready: true, error: "" }); return; }
    const [p, r] = await Promise.all([supabase.from("profiles").select("*").eq("id", user.id).single(), supabase.from("user_roles").select("role,vendor_id").eq("user_id", user.id)]);
    // An account switched during this request must not inherit the previous identity.
    const current = await supabase.auth.getUser();
    if (current.data.user?.id !== user.id) return;
    if (p.error || r.error || !p.data) { setState({ user, profile: null, role: "buyer", vendorId: "", ready: true, error: "Could not load your account. Please try again." }); return; }
    setState({ user, profile: { ...p.data, email: user.email ?? "" }, ...accountAccess(r.data ?? []), ready: true, error: "" });
  }, []);
  useEffect(() => {
    if (!state.user) return;
    const channel = supabase.channel(`account-role-${state.user.id}-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "user_roles", filter: `user_id=eq.${state.user.id}` }, () => { void refresh(); })
      .subscribe();
    const onFocus = () => { void refresh(); };
    window.addEventListener("focus", onFocus);
    return () => { void supabase.removeChannel(channel); window.removeEventListener("focus", onFocus); };
  }, [state.user?.id, refresh]);
  return <AuthContext.Provider value={{ ...state, refresh }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const auth = useContext(AuthContext); if (!auth) throw new Error("AuthProvider missing"); return auth; }