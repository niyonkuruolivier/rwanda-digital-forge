import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, CheckCheck, Package, Tag, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useActivityNotifications } from "@/lib/use-activity-notifications";
import { activityDestination, unreadActivityCount } from "@/lib/activity-notifications";

export function Notifications({ triggerVariant = "ghost", triggerClassName }: { triggerVariant?: ButtonProps["variant"]; triggerClassName?: string }) {
  const activity = useActivityNotifications();
  const [open, setOpen] = useState(false);
  const updates = activity.alerts;
  const count = unreadActivityCount(updates, activity.readIds);
  const markRead = (ids: string[]) => { void activity.markRead(ids).catch(() => toast.error("Could not mark notifications as read. Please try again.")); };
  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild><Button variant={triggerVariant} size="icon" className={cn("relative shrink-0", triggerClassName)} aria-label={`Notifications${count ? `, ${count} unread` : ""}`} title="Notifications"><Bell />{count > 0 && <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold leading-4 text-accent-foreground">{count > 99 ? "99+" : count}</span>}</Button></PopoverTrigger>
    <PopoverContent align="end" className="w-[min(360px,calc(100vw-2rem))] p-0">
      <div className="flex items-center justify-between border-b p-3"><h2 className="font-bold">Notifications</h2><Button size="icon" variant="ghost" disabled={!count} aria-label="Mark all as read" title="Mark all as read" onClick={() => markRead(updates.map((n) => n.id))}><CheckCheck /></Button></div>
      <div className="max-h-[60dvh] overflow-y-auto">
        {!activity.signedIn && <div className="p-4"><Button asChild variant="outline" className="w-full"><Link to="/auth" search={{ next: "/" }}>Sign in for your notifications</Link></Button></div>}
        {activity.signedIn && activity.isPending && <p className="p-4 text-sm text-muted-foreground">Loading notifications…</p>}
        {activity.signedIn && activity.isError && <div className="p-4"><p className="mb-2 text-sm">Could not load notifications.</p><Button variant="outline" size="sm" onClick={() => { void activity.refetch(); }}><RefreshCw />Try again</Button></div>}
        {updates.map((n) => {
          const unread = !activity.readIds.includes(n.id);
          const Icon = n.kind === "order" ? Package : n.kind === "catalog" ? Tag : Bell;
          const content = <><Icon className="mt-0.5 size-4 shrink-0 text-primary" /><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{n.title}</span><span className="mt-1 block text-xs text-muted-foreground">{n.detail}</span><time className="mt-1 block text-[11px] text-muted-foreground" dateTime={n.created_at}>{new Date(n.created_at).toLocaleString()}</time></span>{unread && <span className="mt-1 size-2 shrink-0 rounded-full bg-accent" />}</>;
          const className = `h-auto w-full justify-start gap-3 whitespace-normal rounded-none border-b p-3 text-left ${unread ? "bg-primary/5" : ""}`;
          const read = () => { markRead([n.id]); setOpen(false); };
          return <Button key={n.id} asChild variant="ghost" className={className}><a href={activityDestination(n.href)} onClick={read}>{content}</a></Button>;
        })}
        {activity.signedIn && !activity.isPending && !activity.isError && updates.length === 0 && <div className="p-8 text-center"><Bell className="mx-auto mb-2 size-6 text-muted-foreground" /><p className="text-sm text-muted-foreground">No notifications yet.</p></div>}
      </div>
    </PopoverContent>
  </Popover>;
}