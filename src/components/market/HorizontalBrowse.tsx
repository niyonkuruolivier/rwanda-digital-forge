import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HorizontalBrowse({ children, label, className = "" }: { children: ReactNode; label: string; className?: string }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ previous: false, next: false });

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const update = () => setPosition({ previous: row.scrollLeft > 2, next: row.scrollLeft + row.clientWidth < row.scrollWidth - 2 });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(row);
    for (const child of row.children) observer.observe(child);
    row.addEventListener("scroll", update, { passive: true });
    return () => { observer.disconnect(); row.removeEventListener("scroll", update); };
  }, [children]);

  const move = (direction: number) => {
    const row = rowRef.current;
    if (!row) return;
    row.scrollBy({ left: direction * row.clientWidth * 0.8, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  return <div className={`relative ${className}`}>
    <div ref={rowRef} role="region" aria-label={label} tabIndex={0} className="market-scroll flex items-start gap-4 overflow-x-auto pb-2 pr-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {children}
    </div>
    {position.previous && <Button size="icon" variant="outline" className="absolute left-0 top-1/2 z-10 size-9 -translate-y-1/2 rounded-full bg-card shadow-sm" aria-label={`Previous ${label}`} title={`Previous ${label}`} onClick={() => move(-1)}><ChevronLeft /></Button>}
    <Button size="icon" variant="outline" className="absolute right-0 top-1/2 z-10 size-9 -translate-y-1/2 rounded-full bg-card shadow-sm" aria-label={`Next ${label}`} title={`Next ${label}`} disabled={!position.next} onClick={() => move(1)}><ChevronRight /></Button>
  </div>;
}