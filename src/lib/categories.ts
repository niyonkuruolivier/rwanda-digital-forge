import { z } from "zod";

export const categoryNameSchema = z.string().trim().min(1, "Choose one category.").max(80);
export function requireProductCategory(value: unknown, available: string[]): string {
  const category = categoryNameSchema.parse(value);
  if (!available.includes(category)) throw new Error("Choose one available category.");
  return category;
}