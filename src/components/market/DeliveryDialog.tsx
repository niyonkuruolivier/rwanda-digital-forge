import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Order, OrderItem, OrderStatus } from "@/lib/data";
import type { Delivery } from "@/lib/delivery";
export function DeliveryDialog({ order, item, onClose, onSave }: { order: Order; item: OrderItem; onClose: () => void; onSave: (status: OrderStatus, delivery: Delivery) => Promise<void> }) {
  const [status,setStatus]=useState(item.status);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  return <Dialog open onOpenChange={open => { if (!open && !busy) onClose(); }}><DialogContent className="max-h-[90dvh] overflow-y-auto bg-card"><DialogHeader><DialogTitle>Delivery details</DialogTitle></DialogHeader><p className="text-sm font-semibold">{item.title} · {order.customer}</p>
    <form className="space-y-3" onSubmit={async event => { event.preventDefault(); if(busy) return; const f=new FormData(event.currentTarget); setBusy(true);setError("");try { await onSave(status,{ driverName:String(f.get("driverName")),phone:String(f.get("phone")),email:String(f.get("email")),address:String(f.get("address")),reference:String(f.get("reference")),note:String(f.get("note")) });onClose(); }catch(error){setError(error instanceof Error ? error.message : "Could not save delivery.");}finally{setBusy(false);} }}>
      <div><Label htmlFor="delivery-status">Delivery status</Label><select id="delivery-status" className="h-10 w-full rounded-md border bg-card px-3" value={status} onChange={event=>setStatus(event.target.value as OrderStatus)}>{["Pending","Processing","Shipped","Delivered"].map(value=><option key={value}>{value}</option>)}</select></div>
      <div><Label htmlFor="driver-name">Driver / courier name</Label><Input id="driver-name" name="driverName" maxLength={150} required={status==="Shipped"} defaultValue={item.delivery?.driverName} /></div>
      <div className="grid gap-3 sm:grid-cols-2"><div><Label htmlFor="driver-phone">Driver phone</Label><Input id="driver-phone" name="phone" type="tel" maxLength={50} defaultValue={item.delivery?.phone} /></div><div><Label htmlFor="driver-email">Driver email</Label><Input id="driver-email" name="email" type="email" maxLength={200} defaultValue={item.delivery?.email} /></div></div>
      <div><Label htmlFor="delivery-address">Delivery address</Label><Input id="delivery-address" name="address" maxLength={500} required defaultValue={item.delivery?.address || order.address} /></div>
      <div><Label htmlFor="shipment-reference">Shipment reference (optional)</Label><Input id="shipment-reference" name="reference" maxLength={100} defaultValue={item.delivery?.reference} /></div>
      <div><Label htmlFor="delivery-note">Delivery update (optional)</Label><Textarea id="delivery-note" name="note" maxLength={1000} defaultValue={item.delivery?.note} /></div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button disabled={busy} className="w-full">{busy ? "Saving…" : "Save delivery details"}</Button>
    </form></DialogContent></Dialog>;
}