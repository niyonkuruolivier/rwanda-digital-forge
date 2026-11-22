import { expect, test } from "vitest";
import { listingTextBlocked, uploadedVideoPattern } from "./listing-text";
test("blocks phone numbers, links and outside apps in listings", () => {
  for (const t of ["Call 0788 723 098", "see youtube", "Follow on TikTok", "shop.com", "me@x"]) expect(listingTextBlocked(t)).toBe(true);
});
test("allows sizes and normal details", () => {
  expect(listingTextBlocked("Sizes 39 to 45, 60×60 cm, 40-hour battery")).toBe(false);
});
test("only uploaded video paths count as product videos", () => {
  expect(uploadedVideoPattern.test("/api/public/product-video/shop1/abc.mp4")).toBe(true);
  expect(uploadedVideoPattern.test("https://youtube.com/watch?v=x")).toBe(false);
});
