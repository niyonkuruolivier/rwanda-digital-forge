import { describe, expect, it } from "vitest";
import { detectProductVideo, moveProductPhoto, productImagesSchema, productVideoEmbed, productVideoSchema, youtubeVideoId } from "./product-media";

describe("product media", () => {
  it("accepts more than ten ordered product photos", () => {
    const photos = Array.from({ length: 25 }, (_, i) => `https://example.com/${i}.jpg`);
    expect(productImagesSchema.parse(photos)).toEqual(photos);
  });
  it("requires at least one actual photo", () => {
    expect(productImagesSchema.safeParse([]).success).toBe(false);
    expect(productImagesSchema.safeParse([""]).success).toBe(false);
  });
  it("keeps manually uploaded photos strictly below 30000 bytes", () => {
    expect(productImagesSchema.safeParse(["data:image/webp;base64," + "AAAA".repeat(10000)]).success).toBe(false);
    expect(productImagesSchema.safeParse(["data:image/webp;base64," + "AAAA".repeat(9999)]).success).toBe(true);
  });
  it("lets the seller choose the cover and remaining photo order", () => {
    expect(moveProductPhoto(["front", "second", "third"], 2, 0)).toEqual(["third", "front", "second"]);
    expect(moveProductPhoto(["front", "second", "third"], 0, 1)).toEqual(["second", "front", "third"]);
  });
  it("recognizes YouTube watch, share, shorts and live links", () => {
    for (const link of ["https://www.youtube.com/watch?v=M7lc1UVf-VE", "https://youtu.be/M7lc1UVf-VE?si=test", "https://youtube.com/shorts/M7lc1UVf-VE", "https://youtube.com/live/M7lc1UVf-VE"]) {
      expect(youtubeVideoId(link)).toBe("M7lc1UVf-VE");
      expect(productVideoSchema.safeParse(link).success).toBe(true);
    }
  });
  it("rejects unsupported platforms and spoofed or unsafe links", () => {
    for (const link of ["https://facebook.com/video/123", "https://tiktok.com/video/123", "https://youtube.com.evil.com/watch?v=M7lc1UVf-VE", "http://youtu.be/M7lc1UVf-VE", "javascript:alert(1)", "https://youtube.com/watch?v=bad", "https://instagram.com.evil.com/reel/abc", "https://tiktok.com/@user/photo/1234567890123456789"]) expect(productVideoSchema.safeParse(link).success).toBe(false);
  });
  it("detects Instagram posts and Reels from the same link field", () => {
    for (const path of ["p", "reel", "reels"]) {
      const video = detectProductVideo(`https://www.instagram.com/${path}/CxYz9hTsW-E/?igsh=tracking`);
      expect(video?.platform).toBe("Instagram");
      expect(video && productVideoEmbed(video, "https://market.test")).toBe(`https://www.instagram.com/${path === "p" ? "p" : "reel"}/CxYz9hTsW-E/embed/`);
    }
  });
  it("detects TikTok video links and uses the official muted player", () => {
    const video = detectProductVideo("https://www.tiktok.com/@scout2015/video/6718335390845095173?tracking=yes");
    expect(video?.platform).toBe("TikTok");
    expect(video && productVideoEmbed(video, "https://market.test")).toBe("https://www.tiktok.com/player/v1/6718335390845095173?autoplay=1&muted=1&loop=0");
  });
});