import sharePreview from "@/assets/share-preview.png.asset.json";

/** Canonical origin used for links that leave the app (share sheets, crawlers). */
export const SITE_ORIGIN = "https://rwanda-digital-forge.lovable.app";

/** Absolute link for a page path so a shared link works outside the app. */
export function shareUrl(path: string, origin: string = SITE_ORIGIN) {
  const base = origin.replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Branded 1200x630 card for link previews on pages with no photo of their own. */
export const SHARE_PREVIEW_IMAGE = `${SITE_ORIGIN}${sharePreview.url}`;
