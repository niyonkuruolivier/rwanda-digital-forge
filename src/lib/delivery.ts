import { z } from "zod";
export const deliverySchema = z.object({ driverName: z.string().trim().max(150), phone: z.string().trim().max(50), email: z.union([z.literal(""), z.string().email()]), address: z.string().trim().max(500), reference: z.string().trim().max(100), note: z.string().trim().max(1000), updatedAt: z.string().optional() });
export type Delivery = z.infer<typeof deliverySchema>;
export const deliveryUpdateSchema = z.object({ id: z.string().uuid(), status: z.enum(["Pending", "Processing", "Shipped", "Delivered"]), delivery: deliverySchema }).superRefine((value, ctx) => {
  if (value.status === "Shipped" && (!value.delivery.driverName || (!value.delivery.phone && !value.delivery.email) || !value.delivery.address)) ctx.addIssue({ code: "custom", message: "Add driver name, phone or email and destination before shipping." });
});