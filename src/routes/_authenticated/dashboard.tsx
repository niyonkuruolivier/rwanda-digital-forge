import { InventoryHistory } from "@/components/market/InventoryHistory";
import { vendorOrderCounts, lowStockProducts } from "@/lib/inventory";
import { HeldPayments } from "@/components/market/HeldPayments";
import { VendorApplicationStatus } from "@/components/market/VendorApplicationStatus";
import { FundsBadge } from "@/components/market/FundsBadge";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Banknote, MessageCircle, Package, Pencil, Percent, Phone, Plus, ShoppingBag, Trash2, ExternalLink, Sparkles, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductForm } from "@/components/market/ProductForm";
import { money, type Order, type OrderItem, type OrderStatus, type Product } from "@/lib/data";
import { useStore } from "@/lib/store";
import { StoryDialog, StoryManager } from "@/components/market/StoryManager";
import { canVendorTrade } from "@/lib/admin";
import { paidVendorLines } from "@/lib/orders";
import { holdTimeLeft, itemFunds, vendorBalance } from "@/lib/withdrawals";
import { StoreProfile } from "@/components/market/StoreProfile";
import { StoreProfileEditor } from "@/components/market/StoreProfileEditor";
import { WithdrawalDialog } from "@/components/market/WithdrawalDialog";
import { WithdrawalRecipientDetails } from "@/components/market/WithdrawalRecipientDetails";
import { VendorAgreementRecord } from "@/components/market/VendorAgreementRecord";
import { ProductDiscountDialog } from "@/components/market/ProductDiscountDialog";
import { discountPercent, isDiscounted } from "@/lib/discounts";
import { DeliveryDialog } from "@/components/market/DeliveryDialog";
import { DeliveryDetails } from "@/components/market/DeliveryDetails";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Vendor dashboard — Murandasi Market" }, { name: "description", content: "Manage your products, stock and orders." }, { property: "og:title", content: "Vendor dashboard — Murandasi Market" }, { property: "og:description", content: "Manage your products, stock and orders." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Dashboard,
});

const STATUSES: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered"];

function Dashboard() {
  const s = useStore();
  const [editing, setEditing] = useState<Product | undefined>();
  const [discounting, setDiscounting] = useState<Product | undefined>();
  const [deliveryFor, setDeliveryFor] = useState<{ order: Order; item: OrderItem } | undefined>();
  const [open, setOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  if (s.role !== "vendor") return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Vendor access only</h1>
      <VendorApplicationStatus />
      <p className="mt-2 text-muted-foreground">Apply for a store. Your seller dashboard opens after administrator approval.</p>
      <div className="mt-6 flex justify-center gap-3"><Button asChild variant="outline"><Link to="/become-vendor">Apply for a store</Link></Button></div>
    </div>
  );
  const v = s.vendor(s.myVendorId);
  const blocked = !canVendorTrade(v);
  const mine = s.products.filter((p) => p.vendorId === s.myVendorId);
  const lines = paidVendorLines(s.orders, s.myVendorId);
  const bal = vendorBalance(s.orders, s.withdrawals, s.myVendorId);
  const myWithdrawals = s.withdrawals.filter((w) => w.vendorId === s.myVendorId);
  const counts = vendorOrderCounts(s.orders, s.myVendorId);
  const lowStock = lowStockProducts(mine);
  const metrics = [
    { label: "Total Sales", value: lines.reduce((n, l) => n + l.item.qty, 0), icon: ShoppingBag },
    { label: "Active Listings", value: mine.filter((p) => p.stock > 0).length, icon: Package },
    { label: "Total orders", value: counts.total, icon: ShoppingBag },
    { label: "Pending orders", value: counts.pending, icon: Package },
    { label: "Completed orders", value: counts.completed, icon: Package },
  ];
  return (
    <div className="pb-10">
      {v && <StoreProfile vendor={v} actions={<>
        <Button variant="outline" onClick={() => setProfileOpen(true)}><Pencil />Edit store profile</Button>
        <Button asChild variant="outline"><Link to="/vendors/$id" params={{ id: v.id }}><ExternalLink />View store</Link></Button>
      </>} />}
      <div className="mx-auto max-w-7xl px-4 pt-6">
      {blocked && <p className="mb-4 rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">Store {v?.status === "Suspended" ? "suspended" : "blocked"}: {v?.blockedReason || "Contact the administrator."} {v?.status === "Suspended" && v.suspendedUntil && <>Suspended until {new Date(v.suspendedUntil).toLocaleString("en-GB", { timeZone: "Africa/Kigali" })} (Kigali). </>}New purchases and publishing are paused; your orders and money records remain available.</p>}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Vendor dashboard</h2>
        <div className="flex max-w-full flex-wrap gap-2">
          <Button disabled={blocked} onClick={() => { setEditing(undefined); setOpen(true); }}><Plus className="h-4 w-4" /> Add New Product</Button>
          <Button disabled={blocked} variant="secondary" onClick={() => setStoryOpen(true)}><Sparkles className="h-4 w-4" /> Add Story</Button>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {metrics.map((m) => <div key={m.label} className="rounded-xl border bg-card p-5 shadow-sm"><div className="flex items-center justify-between text-sm text-muted-foreground">{m.label}<m.icon className="h-4 w-4 text-primary" /></div><p className="mt-2 text-2xl font-bold text-heading">{m.value}</p></div>)}
        <div className="col-span-2 rounded-xl border bg-card p-5 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between text-sm text-muted-foreground">Demo balance (87%)<Banknote className="h-4 w-4 text-primary" /></div>
          <p className="mt-2 text-2xl font-bold text-heading">{money(bal.available)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Pending payment: <b>{money(bal.pending + bal.disputed)}</b>{bal.disputed > 0 && <> · of which complaint: <b className="text-destructive">{money(bal.disputed)}</b></>}</p>
          <Button size="sm" className="mt-3 w-full" disabled onClick={() => setWithdrawOpen(true)}>
            <Wallet className="h-4 w-4" /> Payouts not connected
          </Button>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Payments are demonstrations, not received money. Withdrawals are unavailable.</p>
      {s.ordersError && <p role="alert" className="mt-3 text-sm text-destructive">Could not load orders. Refresh to try again.</p>}
      {lowStock.length > 0 && <p role="status" className="mt-3 text-sm text-destructive">Low stock: {lowStock.map(p => `${p.title} (${p.stock === 0 ? "out of stock" : `${p.stock} left`})`).join(" · ")}</p>}
      <HeldPayments vendorId={s.myVendorId} />
      <Tabs defaultValue="products" className="mt-8">
        <div className="market-scroll max-w-full overflow-x-auto"><TabsList><TabsTrigger value="products">Products ({mine.length})</TabsTrigger><TabsTrigger value="orders">Orders ({counts.total})</TabsTrigger><TabsTrigger value="inventory">Inventory history</TabsTrigger><TabsTrigger value="withdrawals">Withdrawals</TabsTrigger><TabsTrigger value="stories">Stories</TabsTrigger><TabsTrigger value="agreement">Agreement</TabsTrigger></TabsList></div>
        <TabsContent value="agreement" className="mt-5"><h3 className="text-lg font-bold">Signed vendor agreement</h3>{s.applications.filter((a) => a.vendor.id === s.myVendorId).map((a) => <article key={a.id} className="border-b py-4"><p className="font-semibold">{a.vendor.name} · {a.status}</p><VendorAgreementRecord application={a} /></article>)}{!s.applications.some((a) => a.vendor.id === s.myVendorId) && <p className="mt-3 text-sm text-muted-foreground">This existing demo store has no signed application agreement.</p>}</TabsContent>
        <TabsContent value="inventory" className="mt-4"><InventoryHistory vendorId={s.myVendorId} /></TabsContent>
        <TabsContent value="stories"><StoryManager /></TabsContent>
        <TabsContent value="withdrawals" className="mt-4 overflow-x-auto rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader><TableRow><TableHead>Reference</TableHead><TableHead>Recipient</TableHead><TableHead>Amount</TableHead><TableHead>Requested</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {myWithdrawals.map((w) => <TableRow key={w.id}><TableCell className="font-mono text-xs">{w.id}</TableCell><TableCell><WithdrawalRecipientDetails recipient={w.recipient} /></TableCell><TableCell className="font-semibold text-heading">{money(w.amount)}</TableCell><TableCell className="text-xs">{new Date(w.requestedAt).toLocaleString("en-GB", { timeZone: "Africa/Kigali" })}</TableCell><TableCell>{w.status === "Paid" ? <span className="font-semibold text-primary">Received {w.paidAt ? new Date(w.paidAt).toLocaleDateString("en-GB") : ""}</span> : <span className="text-muted-foreground">Requested — waiting for admin</span>}</TableCell></TableRow>)}
              {myWithdrawals.length === 0 && <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No withdrawals yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="products" className="mt-4 overflow-x-auto rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {mine.map((p) => (
                <TableRow key={p.id}>
                  <TableCell><div className="flex items-center gap-3"><img src={p.images[0]} alt="" className="h-10 w-10 rounded-md object-cover" /><span className="font-medium text-heading">{p.title}</span></div></TableCell>
                  <TableCell>{p.category}</TableCell><TableCell><p>{money(p.price)}</p>{isDiscounted(p) && <><p className="text-xs text-muted-foreground line-through">{money(p.compareAt ?? p.price)}</p><span className="text-xs font-bold text-primary">-{discountPercent(p)}%</span></>}</TableCell>
                  <TableCell><span className={p.stock === 0 ? "font-semibold text-destructive" : ""}>{p.stock}</span></TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="mr-1" disabled={blocked} onClick={() => setDiscounting(p)}><Percent className="h-4 w-4" />Discount</Button>
                    <Button variant="ghost" size="icon" aria-label="Edit" disabled={blocked} onClick={() => { setEditing(p); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" aria-label="Delete" onClick={async () => { if (confirm(`Delete "${p.title}"?`)) { try { await s.deleteProduct(p.id); toast("Product deleted"); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not delete product."); } } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {mine.length === 0 && <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No products yet — add your first one.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="orders" className="mt-4 overflow-x-auto rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Item</TableHead><TableHead>Amount</TableHead><TableHead>Payment</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {lines.map(({ order, item }) => (
                <TableRow key={item.lineId ?? order.id + item.productId + JSON.stringify(item.options)}>
                  <TableCell><p className="max-w-40 break-all font-medium text-heading">{order.id}</p><p className="text-xs text-muted-foreground">{order.date}</p></TableCell>
                  <TableCell><p>{order.customer}</p><p className="text-xs text-muted-foreground">{order.address}</p>{order.phone && (() => { const wa = order.phone.replace(/[^\d]/g, "").replace(/^0/, "250"); return (
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <a href={`tel:${order.phone}`} className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium text-primary"><Phone className="h-3 w-3" />{order.phone}</a>
                      <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium text-primary"><MessageCircle className="h-3 w-3" />WhatsApp</a>
                    </div>); })()}</TableCell>
                  <TableCell>{item.title} × {item.qty}{item.options && <span className="block text-xs text-muted-foreground">{Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(" · ")}</span>}</TableCell><TableCell>{money(item.price * item.qty)}</TableCell>
                  <TableCell><span className="font-semibold text-primary">Demo paid</span><FundsBadge state={itemFunds(order, item)} left={holdTimeLeft(order)} />{item.claim && <p className="mt-1 max-w-48 text-xs text-destructive">Complaint: {item.claim.message}</p>}<p className="mt-1 text-xs text-muted-foreground">{order.payment}</p><p className="mt-1 max-w-48 break-all font-mono text-xs">{order.paymentReference}</p><p className="mt-1 text-xs text-muted-foreground">{order.paidAt ? new Date(order.paidAt).toLocaleString("en-GB", { timeZone: "Africa/Kigali" }) : ""}</p></TableCell>
                  <TableCell>{item.lineId ? <div className="min-w-56"><p className="font-semibold">{item.status}</p><DeliveryDetails delivery={item.delivery} /><Button size="sm" variant="outline" disabled={blocked} onClick={() => setDeliveryFor({ order, item })}>Update delivery</Button></div> : <select aria-label="Order status" value={item.status} onChange={(e) => s.setItemStatus(order.id, item.productId, e.target.value as OrderStatus)} className="rounded-md border bg-card px-2 py-1 text-sm">{STATUSES.map((st) => <option key={st}>{st}</option>)}</select>}</TableCell>
                </TableRow>
              ))}
              {lines.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No completed payments yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
      <WithdrawalDialog key={String(withdrawOpen)} open={withdrawOpen} onOpenChange={setWithdrawOpen} available={bal.available} onSubmit={s.requestWithdrawal} />
      <ProductForm key={editing?.id ?? "new" + open} open={open} onOpenChange={setOpen} initial={editing} vendorId={s.myVendorId} onSave={async (p) => { await s.upsertProduct(p); toast.success(editing ? "Product updated" : "Product published to the marketplace"); }} />
      {discounting && <ProductDiscountDialog key={discounting.id} product={discounting} onClose={() => setDiscounting(undefined)} onSave={async (p) => { await s.upsertProduct(p); toast.success(isDiscounted(p) ? "Discount saved" : "Discount removed"); }} />}
      <StoryDialog open={storyOpen} onOpenChange={setStoryOpen} />
      {deliveryFor && <DeliveryDialog order={deliveryFor.order} item={deliveryFor.item} onClose={() => setDeliveryFor(undefined)} onSave={async (status, delivery) => { await s.saveOrderDelivery(deliveryFor.item, status, delivery); toast.success("Delivery details saved for the buyer"); }} />}
      {v && <StoreProfileEditor vendor={v} open={profileOpen} onOpenChange={setProfileOpen} onSave={async (details) => { await s.updateVendorProfile(details); setProfileOpen(false); toast.success("Store profile saved"); }} />}
      </div>
    </div>
  );
}
