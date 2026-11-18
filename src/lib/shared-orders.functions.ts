import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { deliveryUpdateSchema } from "./delivery";
import type { Order, OrderItem } from "./data";
export const createSharedOrder = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => z.object({ customer: z.string().trim().min(1).max(200), phone: z.string().trim().min(7).max(50), address: z.string().trim().min(1).max(500), payment: z.enum(["Mobile Money", "Credit Card"]), items: z.array(z.object({ productId: z.string().min(1).max(100), qty: z.number().int().min(1).max(1000), options: z.record(z.string(), z.string()).optional() })).min(1).max(100) }).parse(input)).handler(async ({ data, context }) => {
  const result = await context.supabase.rpc("create_shared_demo_order", { _order: JSON.parse(JSON.stringify(data)) });
  if (result.error) throw new Error(result.error.message);
  return result.data;
});
export const listSharedOrders = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const [orders, items] = await Promise.all([context.supabase.from("shared_orders").select("id,record"), context.supabase.from("shared_order_items").select("id,order_id,record")]);
  if (orders.error || items.error) throw new Error("Could not load orders. Try again.");
  return (orders.data ?? []).map(row => ({ ...(row.record as unknown as Order), shared: true, items: (items.data ?? []).filter(item => item.order_id === row.id).map(item => ({ ...(item.record as unknown as OrderItem), lineId: item.id })) })).sort((a,b) => (b.paidAt ?? "").localeCompare(a.paidAt ?? ""));
});
export const saveDelivery = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => deliveryUpdateSchema.parse(input)).handler(async ({ data, context }) => {
  const result = await context.supabase.rpc("update_shared_delivery", { _id: data.id, _status: data.status, _delivery: JSON.parse(JSON.stringify(data.delivery)) });
  if (result.error) throw new Error(result.error.message);
});
export const reviewSharedItem = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => z.object({ id: z.string().uuid(), action: z.enum(["confirm", "complaint", "released", "refunded"]), message: z.string().max(2000).default(""), photo: z.string().max(50000).default("") }).parse(input)).handler(async ({ data, context }) => {
  const result = await context.supabase.rpc("review_shared_purchase", { _id: data.id, _action: data.action, _message: data.message, _photo: data.photo });
  if (result.error) throw new Error(result.error.message);
});