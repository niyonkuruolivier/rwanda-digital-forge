import { createFileRoute } from "@tanstack/react-router";
import { readCatalogImage } from "@/lib/share-image";

/**
 * Public read-only link to a store or product photo, so shared-link previews
 * (WhatsApp, X, etc.) can show photos that sellers uploaded inside the app.
 * Serves only public catalog photos; never account or private data.
 */
export const Route = createFileRoute("/api/public/share-image")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = new URL(request.url).searchParams;
        const kind = params.get("kind");
        const id = params.get("id") ?? "";
        if ((kind !== "store" && kind !== "product") || !id || id.length > 120) {
          return Response.json({ error: "Unknown share image" }, { status: 400 });
        }

        const image = await readCatalogImage(kind, id).catch(() => undefined);
        if (!image) return Response.json({ error: "No image available" }, { status: 404 });

        if (image.startsWith("https://")) return Response.redirect(image, 302);

        const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(image);
        const contentType = match?.[1];
        const base64 = match?.[2];
        if (!contentType || !base64) return Response.json({ error: "No image available" }, { status: 404 });

        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        return new Response(bytes, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
          },
        });
      },
    },
  },
});
