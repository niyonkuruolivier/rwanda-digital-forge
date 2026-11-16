import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, CheckCheck, Package, Radio, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useStore } from "@/lib/store";
import { marketplaceNotifications, unreadNotificationCount } from "@/lib/notifications";

export function Notifications() {
  const s = useStore();
  const [open, setOpen] = useState(false);
  const updates = marketplaceNotifications(s.orders, s.stories, s.vendors, s.role === "vendor" ? s.myVendorId : undefined);
  const count = unreadNotificationCount(updates, s.readNotificationIds);
  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild><Button variant="ghost" size="icon" className="relative shrink-0" aria-label={`Notifications${count ? `, ${count} unread` : ""}`} title="Notifications"><Bell />{count > 0 && <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold leading-4 text-accent-foreground">{count > 99 ? "99+" : count}</span>}</Button></PopoverTrigger>
    <PopoverContent align="end" className="w-[min(360px,calc(100vw-2rem))] p-0">
      <div className="flex items-center justify-between border-b p-3"><h2 className="font-bold">Notifications</h2><Button size="icon" variant="ghost" disabled={!count} aria-label="Mark all as read" title="Mark all as read" onClick={() => s.markNotificationsRead(updates.map((n) => n.id))}><CheckCheck /></Button></div>
      <div className="max-h-[60dvh] overflow-y-auto">
        {updates.map((n) => {
          const unread = !s.readNotificationIds.includes(n.id);
          const Icon = n.kind === "live" ? Radio : n.kind === "order" ? Package : Tag;
          const content = <><Icon className="mt-0.5 size-4 shrink-0 text-primary" /><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{n.title}</span><span className="mt-1 block text-xs text-muted-foreground">{n.detail}</span></span>{unread && <span className="mt-1 size-2 shrink-0 rounded-full bg-accent" />}</>;
          const className = `h-auto w-full justify-start gap-3 whitespace-normal rounded-none border-b p-3 text-left ${unread ? "bg-primary/5" : ""}`;
          const read = () => { s.markNotificationsRead([n.id]); setOpen(false); };
          return n.vendorId ? <Button key={n.id} asChild variant="ghost" className={className}>{n.productId ? <Link to="/products/$id" params={{ id: n.productId }} onClick={read}>{content}</Link> : <Link to="/vendors/$id" params={{ id: n.vendorId }} onClick={read}>{content}</Link>}</Button> : <Button key={n.id} variant="ghost" className={className} onClick={() => s.markNotificationsRead([n.id])}>{content}</Button>;
        })}
        {updates.length === 0 && <div className="p-8 text-center"><Bell className="mx-auto mb-2 size-6 text-muted-foreground" /><p className="text-sm text-muted-foreground">No notifications yet.</p></div>}
      </div>
    </PopoverContent>
  </Popover>;
}