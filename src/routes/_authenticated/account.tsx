import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Heart, MapPin, Package, Pencil, ShoppingCart, Store, AlertTriangle, Mail, Phone, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { VendorApplicationStatus } from "@/components/market/VendorApplicationStatus";
import { BackButton } from "@/components/market/BackButton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhotoUpload } from "@/components/market/PhotoUpload";
import { FundsBadge } from "@/components/market/FundsBadge";
import { ProductCard } from "@/components/market/ProductCard";
import { buyerOrders, type BuyerProfile } from "@/lib/buyer";
import { money } from "@/lib/data";
import { useStore } from "@/lib/store";
import { holdTimeLeft, itemFunds } from "@/lib/withdrawals";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [
    { title: "My account — Murandasi Market" },
    { name: "description", content: "Your Murandasi Market profile, purchases, saved products and delivery details." },
    { property: "og:title", content: "My account — Murandasi Market" },
    { property: "og:description", content: "Manage your shopping account and purchases on Murandasi Market." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ClientAccount,
});

function ClientAccount() {
  const s = useStore();
  const auth = useAuth();
  const [editing, setEditing] = useState(false);
  const orders = buyerOrders(s.orders, s.buyer.id);
  const complaints = orders.reduce((sum, order) => sum + order.items.filter((item) => item.claim?.status === "open").length, 0);
  const saved = s.products.filter((product) => s.wishlist.includes(product.id));
  if (auth.role === "vendor") return <Navigate to="/dashboard" replace />;
  if (!auth.profile) return <p className="px-4 py-12 text-center text-muted-foreground">{auth.error || "Loading your account…"}</p>;
  return <div className="pb-8">
    <section aria-label="Client profile" className="relative overflow-hidden bg-card">
      {s.buyer.cover && <img src={s.buyer.cover} alt="" width={1536} height={1024} className="absolute inset-0 h-full w-full object-cover object-[center_35%]" />}
      <div className="store-profile-fade absolute inset-0" />
      <div className="absolute inset-x-0 top-3 z-10 mx-auto max-w-5xl px-4"><BackButton onPhoto /></div>
      <div className="relative mx-auto flex min-h-[230px] max-w-5xl items-end gap-4 px-4 pb-6 pt-28 md:min-h-[300px]">
        {s.buyer.photo ? <img src={s.buyer.photo} alt={`${s.buyer.name} profile`} width={112} height={112} className="size-20 shrink-0 rounded-full border-4 border-card bg-card object-cover object-[center_35%] shadow-sm md:size-28" /> : <span className="grid size-20 shrink-0 place-items-center rounded-full border-4 border-card bg-secondary md:size-28"><UserRound className="size-10 text-primary" /></span>}
        <div className="min-w-0 flex-1">
          <span className="text-xs font-semibold text-primary">Customer account</span>
          <h1 className="mt-1 break-words text-2xl font-extrabold md:text-3xl">{s.buyer.name}</h1>
          <p className="mt-2 flex items-center gap-1 text-sm"><MapPin className="size-4 shrink-0 text-primary" />{s.buyer.city || "Rwanda"}</p>
        </div>
        <Button variant="outline" size="icon" className="shrink-0 bg-card" aria-label="Edit profile" title="Edit profile" onClick={() => setEditing(true)}><Pencil /></Button>
      </div>
    </section>
    <div className="mx-auto max-w-5xl px-4">
      <VendorApplicationStatus />
      <nav aria-label="Account shortcuts" className="grid grid-cols-4 border-b py-5">
        {([
          { to: "/orders", icon: Package, label: "My orders", value: orders.length },
          { to: "/wishlist", icon: Heart, label: "Saved", value: saved.length },
          { to: "/cart", icon: ShoppingCart, label: "Cart", value: s.cartCount },
          { to: "/orders", icon: AlertTriangle, label: "Complaints", value: complaints },
        ] as const).map(({ to, icon: Icon, label, value }) => <Button key={label} asChild variant="ghost" className="h-auto flex-col gap-1 px-1 py-2"><Link to={to}><Icon className="size-5 text-primary" /><span className="text-lg font-bold">{value}</span><span className="text-[11px] sm:text-sm">{label}</span></Link></Button>)}
      </nav>
      <section className="border-b py-6" aria-labelledby="account-orders">
        <div className="flex items-center justify-between gap-2"><h2 id="account-orders" className="text-lg font-bold">Recent purchases</h2><Button asChild size="sm" variant="link"><Link to="/orders">View all<ArrowRight /></Link></Button></div>
        {orders.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">No purchases yet. <Link to="/shop" search={{}} className="text-primary">Shop products</Link></p> : <div className="mt-3 divide-y">{orders.slice(0, 3).map((order) => <Link key={order.id} to="/orders" className="flex items-center gap-3 py-4">
          <img src={order.items[0]?.image} alt="" loading="lazy" width={72} height={72} className="size-16 shrink-0 rounded-md bg-muted object-cover sm:size-[72px]" />
          <div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-semibold text-heading">{order.items[0]?.title ?? order.id}</p><p className="mt-1 text-xs text-muted-foreground">{order.id} · {order.items[0]?.status}</p>{order.items[0] && <FundsBadge state={itemFunds(order, order.items[0])} left={holdTimeLeft(order)} />}</div>
          <div className="shrink-0 text-right"><p className="text-xs font-bold text-heading sm:text-sm">{money(order.items.reduce((sum, item) => sum + item.price * item.qty, 0))}</p><ArrowRight className="ml-auto mt-2 size-4 text-muted-foreground" /></div>
        </Link>)}</div>}
      </section>
      <section className="border-b py-6" aria-labelledby="account-details">
        <div className="flex items-center justify-between"><h2 id="account-details" className="text-lg font-bold">My details</h2><Button variant="ghost" size="sm" onClick={() => setEditing(true)}><Pencil />Edit</Button></div>
        <div className="mt-4 grid gap-5 text-sm sm:grid-cols-2">
          <div className="space-y-3"><p className="flex items-center gap-2 break-all"><Mail className="size-4 shrink-0 text-primary" />{s.buyer.email}</p><p className="flex items-center gap-2"><Phone className="size-4 shrink-0 text-primary" />{s.buyer.phone || "No phone added"}</p></div>
          <div className="flex gap-2"><MapPin className="size-4 shrink-0 text-primary" /><div><p className="font-semibold">Delivery address</p><p className="mt-1 break-words text-muted-foreground">{[s.buyer.address, s.buyer.city].filter(Boolean).join(", ") || "No address added"}</p></div></div>
        </div>
      </section>
      {saved.length > 0 && <section className="border-b py-6"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">Saved products</h2><Button asChild variant="link" size="sm"><Link to="/wishlist">View all<ArrowRight /></Link></Button></div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{saved.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}</div></section>}
      {!s.applications.some((a) => a.buyerId === s.buyer.id && a.status === "Pending") && <section className="flex flex-wrap items-center justify-between gap-4 py-6" aria-labelledby="start-selling"><div className="flex items-center gap-3"><Store className="size-7 text-primary" /><div><h2 id="start-selling" className="text-lg font-bold">Become a vendor</h2><p className="mt-1 text-sm text-muted-foreground">Your own store on Murandasi Market.</p></div></div><Button asChild><Link to="/become-vendor">Apply to become a vendor<ArrowRight /></Link></Button></section>}
    </div>
    <Dialog open={editing} onOpenChange={setEditing}><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>Edit my profile</DialogTitle><DialogDescription>Profile and delivery details</DialogDescription></DialogHeader>{editing && <ProfileForm profile={s.buyer} onSave={async (profile) => { try { await s.updateBuyer(profile); setEditing(false); toast.success("Profile saved"); } catch { toast.error("Could not save your profile. Try again."); } }} />}</DialogContent></Dialog>
  </div>;
}

function ProfileForm({ profile, onSave }: { profile: BuyerProfile; onSave: (profile: BuyerProfile) => void }) {
  const [draft, setDraft] = useState(profile);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [coverBusy, setCoverBusy] = useState(false);
  return <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (!photoBusy && !coverBusy) onSave(draft); }}>
    <PhotoUpload id="client-photo" label="Profile photo" value={draft.photo} onChange={(photo) => setDraft((p) => ({ ...p, photo }))} onBusyChange={setPhotoBusy} />
    <PhotoUpload id="client-cover" label="Cover photo" value={draft.cover} onChange={(cover) => setDraft((p) => ({ ...p, cover }))} onBusyChange={setCoverBusy} />
    {([['name', 'Full name'], ['email', 'Email'], ['phone', 'Phone'], ['city', 'City'], ['address', 'Street address']] as const).map(([key, label]) => <div key={key} className="space-y-2"><Label htmlFor={`client-${key}`}>{label}</Label><Input id={`client-${key}`} readOnly={key === "email"} type={key === "email" ? "email" : key === "phone" ? "tel" : "text"} required={key === "name" || key === "email"} value={draft[key]} onChange={(event) => setDraft((p) => ({ ...p, [key]: event.target.value }))} /></div>)}
    <Button type="submit" className="w-full" disabled={photoBusy || coverBusy}>Save changes</Button>
  </form>;
}