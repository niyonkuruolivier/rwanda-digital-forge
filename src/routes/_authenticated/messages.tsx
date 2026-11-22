import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, ShieldAlert, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { chatTextBlocked, CHAT_RULE } from "@/lib/chat-filter";

export const Route = createFileRoute("/_authenticated/messages")({
  validateSearch: (s: Record<string, unknown>) => ({ ...(typeof s["t"] === "string" ? { t: s["t"] } : {}), ...(typeof s["p"] === "string" ? { p: s["p"] } : {}) }) as { t?: string; p?: string },
  head: () => ({ meta: [{ title: "Messages — Murandasi Market" }, { name: "description", content: "Chat safely between buyers and sellers on Murandasi Market." }, { property: "og:title", content: "Messages — Murandasi Market" }, { property: "og:description", content: "Chat safely between buyers and sellers on Murandasi Market." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <ClientOnly fallback={<div className="mx-auto max-w-4xl px-4 py-8"><h1 className="text-2xl font-extrabold">Messages</h1></div>}><Messages /></ClientOnly>,
});

function Messages() {
  const { t, p } = Route.useSearch();
  const nav = Route.useNavigate();
  const auth = useAuth();
  const { vendor, product } = useStore();
  const qc = useQueryClient();
  const threads = useQuery({ queryKey: ["chat-threads", auth.user?.id], queryFn: async () => { const { data, error } = await supabase.from("chat_threads").select("*").order("last_at", { ascending: false }); if (error) throw error; return data; }, refetchInterval: 15000 });
  const active = threads.data?.find((x) => x.id === t) ?? (t ? undefined : threads.data?.[0]);
  const msgs = useQuery({ enabled: !!active, queryKey: ["chat-messages", active?.id], queryFn: async () => { const { data, error } = await supabase.from("chat_messages").select("*").eq("thread_id", active!.id).order("created_at"); if (error) throw error; return data; } });
  useEffect(() => {
    if (!active) return;
    const ch = supabase.channel(`chat-${active.id}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `thread_id=eq.${active.id}` }, () => { void qc.invalidateQueries({ queryKey: ["chat-messages", active.id] }); }).subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [active?.id, qc]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [msgs.data]);
  const blocked = chatTextBlocked(text);
  const item = active ? product(p ?? active.product_id ?? "") : undefined;
  const QUICK = ["Is this still available?", "What sizes do you have?", "Which colours are available?", "Can you deliver today?", "Is the price final?", "Can I see more photos?"];
  const send = async (quick?: string) => {
    const body = (quick ?? text).trim();
    if (!body || !active || sending) return;
    if (chatTextBlocked(body)) { toast.error(CHAT_RULE); return; }
    setSending(true);
    const { error } = await supabase.from("chat_messages").insert({ thread_id: active.id, sender_id: auth.user!.id, body });
    setSending(false);
    if (error) { toast.error(error.code === "42501" ? CHAT_RULE : "Message not sent. Please try again."); return; }
    if (!quick) setText("");
    void qc.invalidateQueries({ queryKey: ["chat-messages", active.id] });
  };
  const label = (th: { buyer_id: string; buyer_name: string; vendor_id: string }) => th.buyer_id === auth.user?.id ? (vendor(th.vendor_id)?.name ?? "Seller") : th.buyer_name;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-extrabold text-heading">Messages</h1>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldAlert className="h-3.5 w-3.5" />{CHAT_RULE}</p>
      {threads.data?.length === 0 ? (
        <div className="mt-8 rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground"><MessageCircle className="mx-auto mb-2 h-8 w-8" />No chats yet. Open a product and tap "Chat with seller". <Link to="/shop" className="text-primary underline">Browse the shop</Link></div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-[16rem_1fr]">
          <ul className={`space-y-1 ${t ? "hidden md:block" : ""}`}>
            {threads.data?.map((th) => (
              <li key={th.id}><button type="button" onClick={() => void nav({ search: { t: th.id } })} className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${active?.id === th.id ? "border-primary bg-primary/5" : "bg-card"}`}>
                <p className="font-semibold">{label(th)}</p><p className="truncate text-xs text-muted-foreground">{th.product_title}</p>
              </button></li>
            ))}
          </ul>
          {active && (
            <section className={`flex h-[65vh] flex-col overflow-hidden rounded-2xl border bg-card ${!t ? "hidden md:flex" : ""}`}>
              <header className="border-b px-4 py-3"><button type="button" onClick={() => void nav({ search: {} })} className="mr-2 text-xs text-primary md:hidden">← Chats</button><span className="font-semibold">{label(active)}</span>{active.product_title && <span className="ml-2 text-xs text-muted-foreground">about {active.product_title}</span>}</header>
              {item && (
                <Link to="/products/$id" params={{ id: item.id }} className="flex items-center gap-3 border-b bg-muted/40 px-4 py-2">
                  <img src={item.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="min-w-0 text-sm"><p className="truncate font-semibold">{item.title}</p><p className="text-xs text-muted-foreground">RWF {item.price.toLocaleString()} · View product</p></div>
                </Link>
              )}
              <div className="flex-1 space-y-2 overflow-y-auto p-4 text-sm">
                {msgs.data?.length === 0 && <p className="text-center text-xs text-muted-foreground">Tap a question below to start the chat.</p>}
                {msgs.data?.map((m) => <div key={m.id} className={m.sender_id === auth.user?.id ? "ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-primary-foreground" : "w-fit max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2"}>{m.body}</div>)}
                <div ref={endRef} />
              </div>
              <form onSubmit={(e) => { e.preventDefault(); void send(); }} className="border-t p-3">
                <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
                  {QUICK.map((q) => <button key={q} type="button" disabled={sending} onClick={() => void send(item && !chatTextBlocked(item.title) ? `${q} (${item.title})` : q)} className="shrink-0 rounded-full border bg-background px-3 py-1 text-xs hover:border-primary disabled:opacity-50">{q}</button>)}
                </div>
                {blocked && <p className="mb-1 text-xs text-destructive">{CHAT_RULE}</p>}
                <div className="flex gap-2">
                  <input value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Write a message…" className="min-h-10 flex-1 rounded-xl border bg-background px-3 text-base outline-none focus:ring-2 focus:ring-primary/40 md:text-sm" />
                  <button type="submit" disabled={!text.trim() || blocked || sending} aria-label="Send" className="flex h-10 w-10 items-center justify-center rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground disabled:opacity-50"><Send className="h-4 w-4" /></button>
                </div>
              </form>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
