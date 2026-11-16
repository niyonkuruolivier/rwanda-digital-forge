import type { ReactNode } from "react";
import { MapPin } from "lucide-react";
import { BackButton } from "./BackButton";
import { ShareButton } from "./ShareButton";
import type { Vendor } from "@/lib/data";
import { Stars } from "./Stars";

export function StoreProfile({ vendor, actions }: { vendor: Vendor; actions?: ReactNode }) {
  return <>
    <section aria-label={`${vendor.name} store profile`} className="relative overflow-hidden bg-card">
      <img src={vendor.banner} alt="" width={1600} height={600} className="absolute inset-0 h-full w-full object-cover" />
      <div className="store-profile-fade absolute inset-0" />
      <div className="absolute inset-x-0 top-3 z-10 mx-auto flex max-w-7xl items-center justify-between gap-2 px-4"><BackButton onPhoto /><ShareButton className="bg-card/60 shadow-md backdrop-blur" path={`/vendors/${vendor.id}`} title={`${vendor.name} — Murandasi Market`} text={vendor.bio} /></div>
      <div className="relative mx-auto flex min-h-[220px] max-w-7xl items-end justify-between gap-4 px-4 pb-6 pt-24 md:min-h-[300px] md:pb-8">
        <div className="min-w-0 flex-1">
          <h1 className="break-words text-2xl font-extrabold md:text-4xl">{vendor.name}</h1>
          <p className="mt-2 flex items-start gap-1 text-sm text-foreground"><MapPin className="size-4 shrink-0 text-primary" /><span className="break-words">{vendor.location}</span></p>
        </div>
        <img src={vendor.logo} alt={`${vendor.name} profile`} width={112} height={112} className="size-20 shrink-0 rounded-full border-4 border-card bg-card object-cover shadow-sm md:size-28" />
      </div>
    </section>
    <div className="mx-auto max-w-7xl px-4">
      <div className="flex flex-col gap-4 border-b py-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 w-full md:flex-1">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground"><span className="flex items-center gap-1"><Stars value={vendor.rating} />{vendor.rating}</span><span>Seller since {vendor.joined}</span></div>
          <p className="mt-3 max-w-2xl break-words">{vendor.bio}</p>
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  </>;
}
