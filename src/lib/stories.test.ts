import { describe, expect, it } from "vitest";
import { SEED_PRODUCTS } from "./data";
import { groupStoriesByVendor, isStoryActive, isStoryLive, safeLiveUrl, sortStories, storiesForVendor, storyAfterTap, storyTimeLeft, validateStory, STORY_TTL_MS, type DealStory } from "./stories";

const NOW = 1_800_000_000_000;
const story: DealStory = { id: "test", vendorId: "kigali-tech", title: "Friday hot deals", image: "photo.jpg", productId: "p1", liveUrl: "https://www.tiktok.com/@seller/live", isLive: false, createdAt: NOW };

describe("deal stories", () => {
  it("groups multiple updates into one account and keeps that account's updates together", () => {
    const newer = { ...story, id: "newer", createdAt: NOW + 1 };
    const other = { ...story, id: "other", vendorId: "other", createdAt: NOW - 1 };
    const expired = { ...story, id: "expired", createdAt: NOW - STORY_TTL_MS };
    const groups = groupStoriesByVendor([other, story, expired, newer], NOW);
    expect(groups.map((g) => g.vendorId)).toEqual(["kigali-tech", "other"]);
    expect(groups[0]?.stories.map((s) => s.id)).toEqual(["newer", "test"]);
    expect(storyAfterTap(groups.flatMap((g) => g.stories), 0, "right")).toBe("test");
  });
  it("shows only the profile seller's unexpired deals", () => {
    const other = { ...story, id: "other", vendorId: "other-store" };
    const expired = { ...story, id: "expired", createdAt: NOW - STORY_TTL_MS };
    expect(storiesForVendor([other, expired, story], "kigali-tech", NOW).map((item) => item.id)).toEqual(["test"]);
  });
  const sequence = ["first", "second", "third"].map((id) => ({ ...story, id }));
  it("moves to the next story when tapping right", () => {
    expect(storyAfterTap(sequence, 0, "right")).toBe("second");
    expect(storyAfterTap(sequence, 1, "right")).toBe("third");
  });
  it("moves to the previous story when tapping left", () => {
    expect(storyAfterTap(sequence, 2, "left")).toBe("second");
    expect(storyAfterTap(sequence, 1, "left")).toBe("first");
  });
  it("stays on the first story when tapping left and closes after the last story", () => {
    expect(storyAfterTap(sequence, 0, "left")).toBe("first");
    expect(storyAfterTap(sequence, 2, "right")).toBeNull();
  });
  it("shows LIVE for a seller-marked live story with a valid link", () => {
    expect(isStoryLive({ ...story, isLive: true })).toBe(true);
    expect(isStoryLive(story)).toBe(false);
    expect(isStoryLive({ ...story, isLive: true, liveUrl: "" })).toBe(false);
  });
  it("accepts TikTok and other HTTPS live links without unsafe protocols", () => {
    expect(safeLiveUrl(story.liveUrl ?? "")).toBe("https://www.tiktok.com/@seller/live");
    expect(safeLiveUrl("https://www.youtube.com/watch?v=123")).toBe("https://www.youtube.com/watch?v=123");
    expect(safeLiveUrl("javascript:alert(1)")).toBeUndefined();
    expect(safeLiveUrl("https://name:password@example.com/live")).toBeUndefined();
  });
  it("rejects going live without a valid link", () => {
    expect(validateStory({ ...story, isLive: true, liveUrl: "invalid" }, "kigali-tech", SEED_PRODUCTS)).toBe("Add a valid HTTPS live-video link.");
    expect(validateStory(story, "kigali-tech", SEED_PRODUCTS)).toBeUndefined();
  });
  it("only links a story to its own seller's product", () => {
    expect(validateStory({ ...story, productId: "p6" }, "kigali-tech", SEED_PRODUCTS)).toBe("Choose a product from your store.");
  });
  it("expires stories after 24 hours", () => {
    expect(isStoryActive(story, NOW + STORY_TTL_MS - 1)).toBe(true);
    expect(isStoryActive(story, NOW + STORY_TTL_MS)).toBe(false);
  });
  it("shows the remaining time before a story disappears", () => {
    expect(storyTimeLeft(story, NOW + 3_600_000)).toBe("23h left");
    expect(storyTimeLeft(story, NOW + STORY_TTL_MS - 5 * 60_000)).toBe("5m left");
    expect(storyTimeLeft(story, NOW + STORY_TTL_MS)).toBe("Expired");
  });
  it("orders stories live first, then newest first, and drops expired ones", () => {
    const old = { ...story, id: "old", isLive: false, createdAt: NOW - 10 * 3_600_000 };
    const fresh = { ...story, id: "fresh", isLive: false, createdAt: NOW - 3_600_000 };
    const live = { ...story, isLive: true, id: "live", createdAt: NOW - 2 * 3_600_000 };
    const expired = { ...story, id: "expired", isLive: false, createdAt: NOW - STORY_TTL_MS };
    expect(sortStories([old, expired, fresh, live], NOW).map((s) => s.id)).toEqual(["live", "fresh", "old"]);
  });
});
import { isLiveExpired as _ile, isStoryLive as _isl, isStoryActive as _isa } from "./stories";
describe("live stories last 3 hours", () => {
  const base = { id: "l", vendorId: "v", title: "t", image: "i", isLive: true, liveUrl: "https://tiktok.com/@a/live", createdAt: 0, liveSince: 0 };
  it("is live before 3 hours", () => { expect(_isl(base, 2.9 * 3_600_000)).toBe(true); });
  it("disappears after 3 hours and can be renewed", () => {
    const t = 3.1 * 3_600_000;
    expect(_isa(base, t)).toBe(false);
    expect(_ile(base, t)).toBe(true);
    expect(_isl({ ...base, liveSince: t }, t + 1000)).toBe(true);
  });
});
