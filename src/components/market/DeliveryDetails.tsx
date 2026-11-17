import { Mail, Phone, Truck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Delivery } from "@/lib/delivery";
export function DeliveryDetails({ delivery }: { delivery?: Delivery | undefined }) {
  if (!delivery) return null;
  return <div className="my-3 space-y-2 border-l-2 border-primary pl-3 text-sm">
    {delivery.driverName && <p className="flex items-center gap-2 font-semibold"><Truck className="size-4 shrink-0 text-primary" />{delivery.driverName}</p>}
    <div className="flex flex-wrap gap-2">{delivery.phone && <Button asChild variant="outline" size="sm"><a href={`tel:${delivery.phone.replace(/[^\d+]/g, "")}`}><Phone />{delivery.phone}</a></Button>}{delivery.email && <Button asChild variant="outline" size="sm" className="h-auto max-w-full whitespace-normal break-all py-2"><a href={`mailto:${delivery.email}`}><Mail />{delivery.email}</a></Button>}</div>
    {delivery.address && <p className="flex items-start gap-2 break-words"><MapPin className="mt-0.5 size-4 shrink-0 text-primary" />{delivery.address}</p>}
    {delivery.reference && <p className="break-all text-xs text-muted-foreground">Shipment: {delivery.reference}</p>}
    {delivery.note && <p className="break-words">{delivery.note}</p>}
    {delivery.updatedAt && <p className="text-xs text-muted-foreground">Updated {new Date(delivery.updatedAt).toLocaleString("en-GB", { timeZone: "Africa/Kigali" })}</p>}
  </div>;
}