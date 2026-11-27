import { z } from "zod";
import type { Order, Vendor } from "./data";
import { paidVendorLines } from "./orders";
export const storeRatingInput = z.object({ vendorId: z.string().min(1).max(200), stars: z.number().int().min(1).max(5) });
export interface StoreRatingSummary { vendor_id: string; average_rating: number; rating_count: number }
export function ratedVendors(vendors: Vendor[], ratings: StoreRatingSummary[]) {
  const scores = new Map(ratings.map((rating) => [rating.vendor_id, rating]));
  return vendors.map((vendor) => ({ ...vendor, rating: Number(scores.get(vendor.id)?.average_rating ?? 0), ratingCount: Number(scores.get(vendor.id)?.rating_count ?? 0) }));
}
export function rankStores(vendors: (Vendor & { ratingCount: number })[], orders: Order[], now = Date.now()) {
  const metrics = new Map(vendors.map((vendor) => {
    const lines = paidVendorLines(orders, vendor.id).filter(({ item }) => item.claim?.status !== "refunded");
    const total = lines.reduce((sum, { item }) => sum + item.qty, 0);
    const recent = lines.filter(({ order }) => { const paid = Date.parse(order.paidAt ?? ""); return paid <= now && paid >= now - 30 * 86400000; }).reduce((sum, { item }) => sum + item.qty, 0);
    return [vendor.id, { total, recent }];
  }));
  const creationTime = (vendor: Vendor) => {
    const time = Date.parse(vendor.createdAt ?? "");
    return Number.isFinite(time) && time <= now ? time : 0;
  };
  const newest = [...vendors].filter(v => creationTime(v) > 0).sort((a, b) => creationTime(b) - creationTime(a) || a.id.localeCompare(b.id))[0];
  const ranked = vendors.filter(v => v.id !== newest?.id).sort((a, b) => (metrics.get(b.id)?.total ?? 0) - (metrics.get(a.id)?.total ?? 0) || (metrics.get(b.id)?.recent ?? 0) - (metrics.get(a.id)?.recent ?? 0) || b.rating - a.rating || b.ratingCount - a.ratingCount || a.id.localeCompare(b.id));
  return newest ? [newest, ...ranked] : ranked;
}