import { describe, it, expect } from "vitest";
import { feedbackInput } from "./feedback";
const photo = "data:image/webp;base64,YQ==";
const base = { targetType: "product", targetId: "p4", message: "Beautiful panel" };
describe("customer feedback", () => {
  it("requires written feedback", () => expect(feedbackInput.safeParse({ ...base, message: " " }).success).toBe(false));
  it("accepts one to three photos but not four", () => {
    for (const count of [1, 2, 3]) expect(feedbackInput.safeParse({ ...base, photos: Array(count).fill(photo) }).success).toBe(true);
    expect(feedbackInput.safeParse({ ...base, photos: Array(4).fill(photo) }).success).toBe(false);
  });
  it("rejects photos at 30 KB", () => expect(feedbackInput.safeParse({ ...base, photos: ["data:image/webp;base64," + "YWFh".repeat(10000)] }).success).toBe(false));
});