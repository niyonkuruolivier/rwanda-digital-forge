import { Check } from "lucide-react";
import type { OrderStatus } from "@/lib/data";
import { trackingStep, trackingSteps } from "@/lib/order-tracking";

export function OrderTracker({ status }: { status: OrderStatus }) {
  const current = trackingStep(status);
  return <div className="my-2" aria-label={`Order stage: ${trackingSteps[current]?.label}`}>
    <ol className="grid grid-cols-4 gap-1">{trackingSteps.map((step, i) => <li key={step.status} className="flex flex-col items-center text-center">
      <span className={`grid size-6 place-items-center rounded-full border text-[10px] font-bold ${i <= current ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}>{i < current ? <Check className="size-3" /> : i + 1}</span>
      <span className={`mt-1 text-[10px] leading-tight sm:text-xs ${i === current ? "font-bold text-primary" : "text-muted-foreground"}`}>{step.label}</span>
    </li>)}</ol>
    <p className="mt-1 text-xs text-muted-foreground">{trackingSteps[current]?.note}</p>
  </div>;
}
