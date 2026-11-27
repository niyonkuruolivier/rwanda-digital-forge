import { useState } from "react";
import { Landmark, Smartphone, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { money } from "@/lib/data";
import { prepareWithdrawal, WITHDRAWAL_FEE, withdrawalPayout, type WithdrawalRecipient } from "@/lib/withdrawals";

export function WithdrawalDialog({ open, onOpenChange, available, onSubmit }: {
  open: boolean; onOpenChange: (open: boolean) => void; available: number; onSubmit: (amount: number, recipient: WithdrawalRecipient) => void;
}) {
  const [recipient, setRecipient] = useState<WithdrawalRecipient>({ method: "Mobile Money", provider: "", accountNumber: "", accountName: "" });
  const [error, setError] = useState("");
  const change = (field: keyof WithdrawalRecipient, value: string) => { setRecipient((p) => ({ ...p, [field]: value })); setError(""); };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader>
    <DialogTitle>Request withdrawal</DialogTitle><DialogDescription>{money(available)} available · demo withdrawal, no money is sent.</DialogDescription>
  </DialogHeader><form className="space-y-4" onSubmit={(event) => {
    event.preventDefault();
    try { const details = prepareWithdrawal(available, available, recipient); onSubmit(available, details); onOpenChange(false); toast.success("Withdrawal requested (demo)."); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not request withdrawal."); }
  }}>
    <div className="grid grid-cols-2 gap-2" aria-label="Withdrawal method">{(["Mobile Money", "Bank"] as const).map((method) => <Button key={method} type="button" variant={recipient.method === method ? "default" : "outline"} aria-pressed={recipient.method === method} onClick={() => { setRecipient({ method, provider: "", accountName: "", accountNumber: "" }); setError(""); }}>{method === "Bank" ? <Landmark /> : <Smartphone />}{method}</Button>)}</div>
    <div className="space-y-2"><label htmlFor="withdraw-provider" className="text-sm font-semibold">{recipient.method === "Bank" ? "Bank name" : "Mobile Money provider"}</label>{recipient.method === "Bank" ? <Input id="withdraw-provider" required maxLength={100} value={recipient.provider} onChange={(e) => change("provider", e.target.value)} /> : <Select value={recipient.provider} onValueChange={(value) => change("provider", value)}><SelectTrigger id="withdraw-provider"><SelectValue placeholder="Choose provider" /></SelectTrigger><SelectContent><SelectItem value="MTN MoMo">MTN MoMo</SelectItem><SelectItem value="Airtel Money">Airtel Money</SelectItem></SelectContent></Select>}</div>
    <div className="space-y-2"><label htmlFor="withdraw-number" className="text-sm font-semibold">{recipient.method === "Bank" ? "Bank account number" : "Mobile Money phone number"}</label><Input id="withdraw-number" required maxLength={60} type={recipient.method === "Mobile Money" ? "tel" : "text"} value={recipient.accountNumber} onChange={(e) => change("accountNumber", e.target.value)} /></div>
    <div className="space-y-2"><label htmlFor="withdraw-name" className="text-sm font-semibold">Registered account name</label><Input id="withdraw-name" required maxLength={150} autoComplete="name" value={recipient.accountName} onChange={(e) => change("accountName", e.target.value)} /></div>
    <div className="rounded-lg border bg-muted/40 p-3 text-sm"><div className="flex justify-between"><span>Amount</span><b>{money(available)}</b></div><div className="flex justify-between text-muted-foreground"><span>Withdrawal fee</span><span>− {money(WITHDRAWAL_FEE)}</span></div><div className="mt-1 flex justify-between border-t pt-1"><span>You receive</span><b className="text-primary">{money(withdrawalPayout(available))}</b></div></div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Button type="submit" className="w-full" disabled={available <= WITHDRAWAL_FEE}><Wallet />Request {money(available)}</Button>
  </form></DialogContent></Dialog>;
}