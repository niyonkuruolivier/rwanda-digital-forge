import { createFileRoute } from "@tanstack/react-router";

/** Streams seller-uploaded product videos (public catalog media only) so they play inside the site. */
export const Route = createFileRoute("/api/public/product-video/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const path = params._splat ?? "";
        if (!/^[A-Za-z0-9_-]{1,120}\/[A-Za-z0-9_-]{1,120}\.(mp4|webm|mov)$/.test(path)) return new Response("Not found", { status: 404 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data } = await supabaseAdmin.storage.from("product-videos").createSignedUrl(path, 300);
        if (!data?.signedUrl) return new Response("Not found", { status: 404 });
        const range = request.headers.get("range");
        const upstream = await fetch(data.signedUrl, range ? { headers: { range } } : {});
        const headers = new Headers();
        for (const h of ["content-type", "content-length", "content-range", "accept-ranges"]) { const v = upstream.headers.get(h); if (v) headers.set(h, v); }
        headers.set("cache-control", "public, max-age=3600");
        return new Response(upstream.body, { status: upstream.status, headers });
      },
    },
  },
});
