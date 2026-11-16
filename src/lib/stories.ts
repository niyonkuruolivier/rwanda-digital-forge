import { SEED_PRODUCTS, type Product } from "./data";

export interface DealStory {
  id: string;
  vendorId: string;
  title: string;
  image: string;
  productId?: string | undefined;
  liveUrl?: string | undefined;
  isLive: boolean;
  createdAt: number;
  /** When the seller last confirmed being live; LIVE lasts 3 hours from here. */
  liveSince?: number | undefined;
}

export const STORY_TTL_MS = 24 * 60 * 60 * 1000;

export const LIVE_TTL_MS = 3 * 60 * 60 * 1000;

function wantsLive(story: DealStory): boolean {
  return story.isLive && Boolean(safeLiveUrl(story.liveUrl ?? ""));
}

function storyEndsAt(story: DealStory): number {
  return wantsLive(story) ? (story.liveSince ?? story.createdAt) + LIVE_TTL_MS : story.createdAt + STORY_TTL_MS;
}

export function isStoryActive(story: DealStory, now = Date.now()): boolean {
  return now < storyEndsAt(story);
}

/** Live story whose 3-hour window passed; seller can confirm they are still live. */
export function isLiveExpired(story: DealStory, now = Date.now()): boolean {
  return wantsLive(story) && !isStoryActive(story, now);
}

export function storyTimeLeft(story: DealStory, now = Date.now()): string {
  const left = storyEndsAt(story) - now;
  if (left <= 0) return "Expired";
  const hours = Math.floor(left / 3_600_000);
  if (hours >= 1) return `${hours}h left`;
  return `${Math.max(1, Math.floor(left / 60_000))}m left`;
}

export function sortStories(stories: DealStory[], now = Date.now()): DealStory[] {
  return stories
    .filter((story) => isStoryActive(story, now))
    .sort((a, b) => Number(isStoryLive(b)) - Number(isStoryLive(a)) || b.createdAt - a.createdAt);
}

export function storiesForVendor(stories: DealStory[], vendorId: string, now = Date.now()): DealStory[] {
  return sortStories(stories.filter((story) => story.vendorId === vendorId), now);
}

export function groupStoriesByVendor(stories: DealStory[], now = Date.now()): { vendorId: string; stories: DealStory[] }[] {
  const groups = new Map<string, DealStory[]>();
  for (const story of sortStories(stories, now)) {
    const group = groups.get(story.vendorId);
    if (group) group.push(story);
    else groups.set(story.vendorId, [story]);
  }
  return Array.from(groups, ([vendorId, stories]) => ({ vendorId, stories }));
}

export function storyAfterTap(stories: DealStory[], index: number, direction: "left" | "right"): string | null {
  const nextIndex = direction === "left" ? Math.max(0, index - 1) : index + 1;
  return stories[nextIndex]?.id ?? null;
}

export function safeLiveUrl(value: string): string | undefined {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.username || url.password) return undefined;
    return url.href;
  } catch { return undefined; }
}

export function isStoryLive(story: DealStory, now = Date.now()): boolean {
  return wantsLive(story) && isStoryActive(story, now);
}

export function validateStory(story: DealStory, vendorId: string, products: Product[]): string | undefined {
  if (story.vendorId !== vendorId) return "Choose a story from your store.";
  if (!story.title.trim() || !story.image) return "Add a title and photo.";
  if (story.productId && !products.some((p) => p.id === story.productId && p.vendorId === vendorId)) return "Choose a product from your store.";
  if (story.isLive && !safeLiveUrl(story.liveUrl ?? "")) return "Add a valid HTTPS live-video link.";
  return undefined;
}

// Example deal stories use the existing demo catalog; no seller is marked live by default.
// Staggered ages so the time-left indicator shows different values.
export const SEED_STORIES: DealStory[] = ["p1", "p6", "p10", "p5"].flatMap((id, i) => {
  const p = SEED_PRODUCTS.find((product) => product.id === id);
  const image = p?.images[0];
  return p && image ? [{ id: `story-${id}`, vendorId: p.vendorId, title: p.title, image, productId: p.id, isLive: false, createdAt: Date.now() - (i + 1) * 3 * 3_600_000 }] : [];
});