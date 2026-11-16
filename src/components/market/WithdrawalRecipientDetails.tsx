import type { WithdrawalRecipient } from "@/lib/withdrawals";

export function WithdrawalRecipientDetails({ recipient }: { recipient?: WithdrawalRecipient | undefined }) {
  if (!recipient) return <span className="text-xs text-muted-foreground">No recipient details · older demo</span>;
  return <div className="min-w-44 max-w-64 whitespace-normal break-words text-sm">
    <p className="font-semibold">{recipient.accountName}</p>
    <p className="text-xs text-muted-foreground">{recipient.method} · {recipient.provider}</p>
    <p className="mt-1 break-all font-mono text-xs">{recipient.accountNumber}</p>
  </div>;
}