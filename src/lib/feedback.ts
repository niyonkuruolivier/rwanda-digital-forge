import { z } from "zod";

export const feedbackInput = z.object({ targetType: z.enum(["product", "shop"]), targetId: z.string().min(1).max(200), message: z.string().trim().min(1).max(2000), photos: z.array(z.string().refine((value) => {
  const match = /^data:image\/(?:webp|jpeg|png);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match?.[1]) return false;
  return match[1].length * 3 / 4 - (match[1].endsWith("==") ? 2 : match[1].endsWith("=") ? 1 : 0) < 30000;
}, "Each photo must be below 30 KB.")).max(3).default([]) });