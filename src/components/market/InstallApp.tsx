import { useEffect, useState } from "react";
import { Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallApp({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  const [iphone, setIphone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)");
    setInstalled(standalone.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
    setIphone(/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
    const ready = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); };
    const done = () => { setInstalled(true); setPrompt(null); };
    window.addEventListener("beforeinstallprompt", ready);
    window.addEventListener("appinstalled", done);
    return () => { window.removeEventListener("beforeinstallprompt", ready); window.removeEventListener("appinstalled", done); };
  }, []);

  async function install() {
    if (!prompt) return;
    setBusy(true); setError(false);
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      setPrompt(null);
      if (choice.outcome === "accepted") setInstalled(true);
    } catch { setPrompt(null); setError(true); }
    finally { setBusy(false); }
  }

  const appUrl = "https://rwanda-digital-forge.lovable.app/";
  const emailUrl = `mailto:?subject=${encodeURIComponent("Murandasi Market app")}&body=${encodeURIComponent(`Open Murandasi Market on your phone or computer: ${appUrl}\n\nUse your browser menu to add it to your Home Screen or install it as an app. Internet access is required.`)}`;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] max-w-sm overflow-y-auto rounded-lg">
        <img src="/icons/app-192.png" width={80} height={80} alt="Murandasi Market" className="mx-auto size-20 rounded-lg border bg-card" />
        <DialogHeader>
          <DialogTitle>{installed ? "Murandasi is installed" : "Install Murandasi Market"}</DialogTitle>
          <DialogDescription>{installed ? "Open Murandasi from your app icon." : "Add Murandasi to your phone or computer."}</DialogDescription>
        </DialogHeader>
        {!installed && <>
          {prompt ? <Button onClick={() => void install()} disabled={busy}><Download />{busy ? "Installing…" : "Install app"}</Button> : <ol className="list-decimal space-y-2 pl-5 text-sm text-foreground">
            {iphone ? <><li>Open the website in Safari.</li><li>Tap Share, then Add to Home Screen.</li><li>Keep Open as Web App on, then tap Add.</li></> : <><li>Open the website in Chrome, Edge or your phone’s browser.</li><li>Open the browser menu.</li><li>Choose Install app or Add to Home screen, then confirm.</li></>}
          </ol>}
          {error && <p role="alert" className="text-sm text-destructive">Installation didn’t finish. Use your browser menu to try again.</p>}
          <p className="text-xs text-muted-foreground">Internet access is required. If installation is unavailable here, open the live website in your browser.</p>
          <Button asChild variant="link" className="h-auto whitespace-normal"><a href={appUrl} target="_blank" rel="noopener noreferrer">Open live website</a></Button>
        </>}
        <Button asChild variant="outline"><a href={emailUrl}><Mail />Email app link</a></Button>
      </DialogContent>
    </Dialog>
  );
}