import { createFileRoute } from "@tanstack/react-router";
import { detectProductVideo, productVideoThumbnail } from "@/lib/product-media";

const THUMBNAIL_HOSTS = /^(scontent[a-z0-9.-]*\.cdninstagram\.com|([a-z0-9-]+\.)?fbcdn\.net|([a-z0-9-]+\.)?tiktokcdn[a-z0-9.-]*\.com|i\.ytimg\.com|img\.youtube\.com)$/;

async function oembedThumbnail(endpoint: string): Promise<string | undefined> {
  try {
    const res = await fetch(endpoint, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return undefined;
    const data: unknown = await res.json();
    const url = typeof data === "object" && data !== null ? (data as Record<string, unknown>)["thumbnail_url"] : undefined;
    if (typeof url !== "string") return undefined;
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || !THUMBNAIL_HOSTS.test(parsed.hostname.toLowerCase())) return undefined;
    return parsed.toString();
  } catch {
    return undefined;
  }
}

export const Route = createFileRoute("/api/public/video-thumbnail")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const raw = new URL(request.url).searchParams.get("url") ?? "";
        const video = detectProductVideo(raw);
        if (!video) return Response.json({ error: "Unsupported video link" }, { status: 400 });

        let thumbnail = productVideoThumbnail(video);
        if (!thumbnail && video.platform === "Instagram") {
          thumbnail = await oembedThumbnail(`https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(video.url)}`);
        }
        if (!thumbnail && video.platform === "TikTok") {
          thumbnail = await oembedThumbnail(`https://www.tiktok.com/oembed?url=${encodeURIComponent(video.url)}`);
        }
        if (!thumbnail) return Response.json({ error: "No thumbnail available" }, { status: 404 });

        // Stream the image through this route: some CDNs send Cross-Origin-Resource-Policy
        // headers that block direct embedding on other sites.
        try {
          const image = await fetch(thumbnail, { signal: AbortSignal.timeout(8000) });
          const type = image.headers.get("content-type") ?? "";
          if (!image.ok || !type.startsWith("image/") || !image.body) {
            return Response.json({ error: "Thumbnail fetch failed" }, { status: 502 });
          }
          return new Response(image.body, {
            headers: {
              "Content-Type": type,
              "Cache-Control": "public, max-age=86400, s-maxage=86400",
            },
          });
        } catch {
          return Response.json({ error: "Thumbnail fetch failed" }, { status: 502 });
        }
      },
    },
  },
});
