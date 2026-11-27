import { useEffect, useRef, useState } from "react";
import { detectProductVideo, isUploadedVideo, productVideoEmbed } from "@/lib/product-media";

export function ProductVideo({ url, title, gallery = false }: { url: string; title: string; gallery?: boolean }) {
  const video = detectProductVideo(url);
  const container = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const visible = useRef(false);
  const [started, setStarted] = useState(false);
  const [origin, setOrigin] = useState("");
  const command = (playing: boolean) => {
    if (video?.platform === "YouTube") {
      frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "mute", args: [] }), "https://www.youtube-nocookie.com");
      frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func: playing ? "playVideo" : "pauseVideo", args: [] }), "https://www.youtube-nocookie.com");
    } else if (video?.platform === "TikTok") {
      frame.current?.contentWindow?.postMessage({ type: "mute", value: true, "x-tiktok-player": true }, "https://www.tiktok.com");
      frame.current?.contentWindow?.postMessage({ type: playing ? "play" : "pause", value: null, "x-tiktok-player": true }, "https://www.tiktok.com");
    }
  };
  useEffect(() => {
    setOrigin(window.location.origin);
    const element = container.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.5);
      if (visible.current) setStarted(true);
      command(visible.current);
    }, { threshold: [0, 0.5] });
    observer.observe(element);
    return () => observer.disconnect();
  }, [url]);
  if (isUploadedVideo(url)) return <section aria-label="Product video" className={gallery ? "flex h-full flex-col p-3" : "mt-4"}>
    {!gallery && <h2 className="mb-3 text-lg font-bold text-heading">Product video</h2>}
    <video src={url} controls playsInline autoPlay muted controlsList="nodownload noremoteplayback" disablePictureInPicture onContextMenu={(e) => e.preventDefault()} className={`w-full rounded-lg bg-muted ${gallery ? "min-h-0 flex-1 object-contain" : "max-h-[70vh]"}`} />
  </section>;
  if (!video) return null;
  return <section aria-label="Product video" className={gallery ? "flex h-full flex-col p-3" : "mt-4"}>
    {!gallery && <h2 className="mb-3 text-lg font-bold text-heading">Product video</h2>}
    <div ref={container} className={`w-full overflow-hidden rounded-lg bg-muted ${gallery ? "min-h-0 flex-1" : video.platform === "YouTube" ? "aspect-video" : "mx-auto aspect-[9/16] max-w-[400px]"}`}>
      {started && origin && <iframe ref={frame} className="h-full w-full" title={`${title} — ${video.platform} video`} src={productVideoEmbed(video, origin)} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" onLoad={() => command(visible.current)} />}
    </div>
  </section>;
}