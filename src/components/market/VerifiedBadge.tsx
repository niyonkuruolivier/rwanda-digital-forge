import { BadgeCheck } from "lucide-react";

export function VerifiedBadge({ verified, compact = false }: { verified?: boolean | undefined; compact?: boolean }) {
  if (!verified) return null;
  return <span title="Verified by Murandasi Market" aria-label="Verified vendor" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary"><BadgeCheck aria-hidden="true" className="size-4 shrink-0" />{!compact && "Verified"}</span>;
}