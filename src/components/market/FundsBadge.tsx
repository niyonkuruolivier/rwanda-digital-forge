import type { FundsState } from "@/lib/withdrawals";

const LABEL: Record<FundsState, string> = { pending: "Pending", disputed: "On hold — complaint", available: "Released", refunded: "Refunded to buyer" };

export function FundsBadge({ state, left }: { state: FundsState; left?: string }) {
  const tone = state === "available" ? "bg-primary/10 text-primary" : state === "pending" ? "bg-secondary text-secondary-foreground" : "bg-destructive/10 text-destructive";
  return <span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold ${tone}`}>{LABEL[state]}{state === "pending" && left ? ` · ${left} left` : ""}</span>;
}
