import { z } from "zod";

export function youtubeVideoId(value: string): string | undefined {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return;
    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split("/").filter(Boolean);
    const id = host === "youtu.be" ? parts[0] : ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(host)
      ? url.pathname === "/watch" ? url.searchParams.get("v") : ["shorts", "embed", "live"].includes(parts[0] ?? "") ? parts[1] : undefined
      : undefined;
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : undefined;
  } catch { return; }
}

export interface ProductVideoLink { platform: "YouTube" | "Instagram" | "TikTok"; id: string; url: string }
export function detectProductVideo(value: string): ProductVideoLink | undefined {
  const youtube = youtubeVideoId(value);
  if (youtube) return { platform: "YouTube", id: youtube, url: `https://www.youtube.com/watch?v=${youtube}` };
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.username || url.password || url.port) return;
    const host = url.hostname.toLowerCase();
    const instagram = /^\/(reel|reels|p)\/([A-Za-z0-9_-]+)\/?$/.exec(url.pathname);
    if (["instagram.com", "www.instagram.com"].includes(host) && instagram?.[2]) {
      return { platform: "Instagram", id: instagram[2], url: `https://www.instagram.com/${instagram[1] === "p" ? "p" : "reel"}/${instagram[2]}/` };
    }
    const tiktok = /^\/@[A-Za-z0-9._]+\/video\/(\d{15,25})\/?$/.exec(url.pathname);
    if (["tiktok.com", "www.tiktok.com", "m.tiktok.com"].includes(host) && tiktok?.[1]) return { platform: "TikTok", id: tiktok[1], url: `https://www.tiktok.com${url.pathname.replace(/\/$/, "")}` };
  } catch { return; }
  return undefined;
}
export function productVideoThumbnail(video: ProductVideoLink): string | undefined {
  if (video.platform === "YouTube") return `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
  return undefined;
}
export function productVideoEmbed(video: ProductVideoLink, origin: string): string {
  if (video.platform === "YouTube") return `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&mute=1&playsinline=1&enablejsapi=1&rel=0&origin=${encodeURIComponent(origin)}`;
  if (video.platform === "TikTok") return `https://www.tiktok.com/player/v1/${video.id}?autoplay=1&muted=1&loop=0`;
  return `${video.url}embed/`;
}
export const productVideoSchema = z.string().trim().max(2048).refine((value) => Boolean(detectProductVideo(value)), "Paste a YouTube, Instagram post/Reel, or full TikTok video link.");
export const catalogPhotoSchema = z.string().max(100_000).refine((value) => {
  if (!value) return true;
  if (value.startsWith("https://")) return true;
  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  const bytes = match?.[2];
  return Boolean(bytes && Math.floor(bytes.length * 3 / 4) - (bytes.endsWith("==") ? 2 : bytes.endsWith("=") ? 1 : 0) < 30_000);
}, "Choose a photo smaller than 30 KB.");
export const productImagesSchema = z.array(catalogPhotoSchema.refine(Boolean, "Choose a product photo.")).min(1);

export function moveProductPhoto(images: string[], from: number, to: number): string[] {
  if (from < 0 || from >= images.length || to < 0 || to >= images.length) return images;
  const next = [...images];
  const [photo] = next.splice(from, 1);
  if (photo === undefined) return images;
  next.splice(to, 0, photo);
  return next;
}