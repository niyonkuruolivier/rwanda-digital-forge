import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Bot, Send, X, Square } from "lucide-react";

const WHATSAPP = "250788723098";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.43 9.43 0 1 1 7.99 4.42zm8.02-17.45A11.27 11.27 0 0 0 12.04.75C5.8.75.72 5.83.72 12.07c0 2 .52 3.94 1.51 5.65L.62 23.25l5.66-1.48a11.3 11.3 0 0 0 5.76 1.47h.01c6.24 0 11.32-5.08 11.32-11.32 0-3.02-1.18-5.87-3.31-8z" />
    </svg>
  );
}

export function HelpButtons() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, status, stop, error } = useChat({ transport: new DefaultChatTransport({ api: "/api/chat" }) });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open, status]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [messages, status]);

  const send = () => {
    const text = input.trim();
    if (!text || busy) return;
    void sendMessage({ text });
    setInput("");
  };

  return (
    <>
      {!open && (
        <div className="fixed bottom-20 right-3 z-40 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
          <button type="button" onClick={() => setOpen(true)} aria-label="Ask Murandasi AI assistant"
            className="relative flex h-12 w-12 items-center justify-center rounded-full border border-primary-foreground/30 bg-[image:var(--gradient-primary)] text-primary-foreground shadow-lg ring-2 ring-primary/20 transition-transform hover:scale-105">
            <Bot className="h-6 w-6" />
            <span className="absolute -right-1 -top-1 rounded-full border border-primary-foreground bg-foreground px-1.5 text-[10px] font-bold leading-4 text-background">AI</span>
          </button>
          <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hello Murandasi Market, I need help.")}`} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-card text-primary shadow-lg ring-2 ring-primary/15 transition-transform hover:scale-105">
            <WhatsAppIcon className="h-6 w-6" />
          </a>
        </div>
      )}

      {open && (
        <section aria-label="Murandasi AI assistant"
          className="fixed inset-x-0 bottom-0 top-16 z-50 flex flex-col overflow-hidden border bg-card shadow-2xl md:inset-x-auto md:bottom-6 md:right-6 md:top-auto md:h-[34rem] md:w-96 md:rounded-2xl">
          <header className="flex items-center gap-2 bg-[image:var(--gradient-primary)] px-4 py-3 text-primary-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20"><Bot className="h-5 w-5" /></span>
            <div className="flex-1 leading-tight"><p className="text-sm font-semibold">Murandasi AI</p><p className="text-xs opacity-80">Shopping assistant</p></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="rounded-full p-1.5 hover:bg-primary-foreground/20"><X className="h-5 w-5" /></button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm">
            {messages.length === 0 && <p className="text-muted-foreground">Muraho! Ask me about products, orders, delivery or selling on Murandasi.</p>}
            {messages.map((m) => (
              <div key={m.id} className={m.role === "user" ? "ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-primary-foreground" : "max-w-[90%] whitespace-pre-wrap text-foreground"}>
                {m.parts.map((p, i) => (p.type === "text" ? <span key={i}>{p.text}</span> : null))}
              </div>
            ))}
            {status === "submitted" && <p className="animate-pulse text-muted-foreground">Thinking…</p>}
            {error && <p className="text-destructive">{error.message || "Something went wrong."}</p>}
            <div ref={endRef} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-end gap-2 border-t bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} rows={1} placeholder="Type your question…"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              className="max-h-32 min-h-10 flex-1 resize-none rounded-xl border bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-primary/40 md:text-sm" />
            {busy ? (
              <button type="button" onClick={() => void stop()} aria-label="Stop" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground"><Square className="h-4 w-4" /></button>
            ) : (
              <button type="submit" disabled={!input.trim()} aria-label="Send" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground disabled:opacity-50"><Send className="h-4 w-4" /></button>
            )}
          </form>
        </section>
      )}
    </>
  );
}
