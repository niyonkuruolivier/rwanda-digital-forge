import { useEffect, useState, type CSSProperties } from "react";

/** Phone chat panel that fits between the top bar and the bottom menu, and shrinks above the keyboard like WhatsApp. */
export function useChatViewport(active: boolean, top = 64): CSSProperties | undefined {
  const [style, setStyle] = useState<CSSProperties>();
  useEffect(() => {
    if (!active) return;
    const vv = window.visualViewport;
    const update = () => {
      if (window.innerWidth >= 768) return setStyle(undefined);
      const h = vv?.height ?? window.innerHeight;
      const offset = vv?.offsetTop ?? 0;
      const keyboard = window.innerHeight - h > 150;
      const nav = document.querySelector<HTMLElement>('nav[aria-label="Main navigation"]')?.offsetHeight ?? 64;
      const t = keyboard ? 8 : top;
      setStyle({ position: "fixed", left: 8, right: 8, top: offset + t, height: h - t - (keyboard ? 8 : nav + 6), bottom: "auto", zIndex: 50 });
      if (keyboard) window.scrollTo(0, 0);
    };
    update();
    vv?.addEventListener("resize", update); vv?.addEventListener("scroll", update); window.addEventListener("resize", update);
    return () => { vv?.removeEventListener("resize", update); vv?.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [active, top]);
  return active ? style : undefined;
}
