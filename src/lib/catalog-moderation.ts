import { z } from "zod";
import { catalogPhotoSchema } from "./product-media";
import { categoryNameSchema } from "./categories";

export const categoryPictureSchema = z.object({ name: categoryNameSchema, image: catalogPhotoSchema.refine((value) => value.startsWith("data:image/"), "Choose a category picture.") });
export const removePostSchema = z.object({ kind: z.enum(["product", "story"]), id: z.string().min(1).max(100) });
export function requireCatalogAdministrator(allowed: boolean, error?: unknown) {
  if (error || !allowed) throw new Error("Administrator access required.");
}