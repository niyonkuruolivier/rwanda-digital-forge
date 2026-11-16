import type { Order, Vendor } from "./data";
import { isStoryLive, type DealStory } from "./stories";
import { hasCompletedPayment } from "./orders";

export interface MarketNotification {
  id: string;
  title: string;
  detail: string;
  kind: "order" | "story" | "live";
  vendorId?: string | undefined;
  productId?: string | undefined;
}

export function marketplaceNotifications(orders: Order[], stories: DealStory[], vendors: Vendor[], vendorId?: string): MarketNotification[] {
  const updates: MarketNotification[] = stories.map((story) => {
    const live = isStoryLive(story);
    const seller = vendors.find((v) => v.id === story.vendorId)?.name ?? "Store";
    return { id: `story:${story.id}:${live}:${story.title}:${story.liveUrl ?? ""}`, title: live ? `${seller} is live` : `${seller} shared a deal`, detail: story.title, kind: live ? "live" : "story", vendorId: story.vendorId, productId: story.productId };
  });
  return [...orders.filter(hasCompletedPayment).flatMap((order) => order.items.filter((item) => !vendorId || item.vendorId === vendorId).map((item) => ({ id: `order:${order.id}:${item.productId}:${item.status}`, title: vendorId ? `${order.customer} · Demo paid` : `${order.id} · ${item.status}`, detail: item.title, kind: "order" as const }))), ...updates];
}

export function unreadNotificationCount(updates: MarketNotification[], readIds: string[]) {
  return updates.filter((update) => !readIds.includes(update.id)).length;
}