import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export function BackButton({ onPhoto = false }: { onPhoto?: boolean }) {
  const router = useRouter();
  return <Button asChild variant={onPhoto ? "outline" : "ghost"} className={onPhoto ? "bg-card" : "px-2"}>
    <Link to="/" onClick={(event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (router.history.canGoBack()) { event.preventDefault(); router.history.back(); }
    }}><ArrowLeft />Back</Link>
  </Button>;
}

export function PageBack() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { role, vendor, myVendorId } = useStore();
  const hasPhotoBack = pathname === "/account" || (pathname === "/dashboard" && role === "vendor" && !!vendor(myVendorId)) || (pathname.startsWith("/vendors/") && !!vendor(pathname.slice("/vendors/".length)));
  if (pathname === "/" || hasPhotoBack) return null;
  return <div className="mx-auto max-w-7xl px-4 pt-3"><BackButton /></div>;
}