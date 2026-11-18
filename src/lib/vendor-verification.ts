import { z } from "zod";
import type { Vendor } from "./data";

export const verificationSchema = z.object({ vendorId: z.string().trim().min(1).max(100), verified: z.boolean() });

export function requireVerificationAdministrator(allowed: boolean, error?: unknown) {
  if (error || !allowed) throw new Error("Administrator access required.");
}

export function verifiedVendors<T extends Vendor>(vendors: T[], rows: { vendor_id: string; verified: boolean }[]): (T & { verified: boolean })[] {
  const statuses = new Map(rows.map((row) => [row.vendor_id, row.verified]));
  return vendors.map((vendor) => ({ ...vendor, verified: statuses.get(vendor.id) === true }));
}