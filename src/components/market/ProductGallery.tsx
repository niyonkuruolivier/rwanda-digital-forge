import { useState, type ReactNode } from "react";
import { Heart, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductVideo } from "@/components/market/ProductVideo";
import { detectProductVideo } from "@/lib/product-media";

export function ProductGallery({ title, images, videoUrl, wished, onToggleWish, overlay }: { title: string; images: string[]; videoUrl?: string | undefined; wished: boolean; onToggleWish: () => void; overlay?: ReactNode }) {
  const [selected, setSelected] = useState<number | "video">(0);
  const video = videoUrl ? detectProductVideo(videoUrl) : undefined;
  const showVideo = selected === "video" && video;
  return <div className="min-w-0">
    <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-card shadow-sm">
      {showVideo ? <ProductVideo url={video.url} title={title} gallery /> : <img src={images[typeof selected === "number" ? selected : 0] ?? images[0]} alt={`${title} — photo ${typeof selected === "number" ? selected + 1 : 1}`} className="h-full w-full object-cover" />}
      {overlay && <div className="absolute left-3 top-3 flex items-center gap-2">{overlay}</div>}
      {!showVideo && <Button variant="ghost" size="icon" onClick={onToggleWish} aria-label="Wishlist" className="absolute right-3 top-3 rounded-full bg-card/90 shadow-md backdrop-blur"><Heart className={`h-5 w-5 ${wished ? "fill-accent text-accent" : "text-muted-foreground"}`} /></Button>}
    </div>
    <div aria-label="Product media" className="mt-3 flex gap-3 overflow-x-auto pb-1">
      {images.map((src, index) => <Button key={`${index}-${src}`} variant="ghost" aria-label={`Show photo ${index + 1}`} aria-pressed={selected === index} onClick={() => setSelected(index)} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 p-0 ${selected === index ? "border-primary" : "border-transparent"}`}><img src={src} alt="" className="h-full w-full object-cover" /></Button>)}
      {video && <Button variant="outline" aria-label="Play product video" aria-pressed={selected === "video"} onClick={() => setSelected("video")} className={`h-16 w-16 shrink-0 rounded-lg border-2 p-0 ${selected === "video" ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted text-heading"}`}><Play className="h-6 w-6" /></Button>}
    </div>
  </div>;
}