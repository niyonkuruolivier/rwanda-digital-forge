// Mirrors public.listing_text_blocked in the database (the database is the final authority).
const APPS = "youtube|youtu|instagram|insta|tiktok|tik tok|facebook|messenger|telegram|snapchat|twitter|linkedin|whatsapp|wechat|gmail|yahoo|momo|ussd|telefone|phone|nimero|numero|numéro";
const APP_RE = new RegExp(`(^|[^\\p{L}])(${APPS})(?=$|[^\\p{L}])`, "iu");
export function listingTextBlocked(text: string) {
  return /[0-9][0-9 ()./-]{6,}[0-9]/.test(text) || text.includes("@") || APP_RE.test(text)
    || /(https?:|www\.|[a-z]\.(com|rw|net|org|me|be|ly|io|co|tv|app|gg|link|info|biz|site|xyz)\b)/i.test(text);
}
export const LISTING_RULE = "Phone numbers, links, emails and outside apps (YouTube, TikTok, Instagram, WhatsApp) are not allowed. Buyers contact you and pay only on the website.";
export const uploadedVideoPattern = /^\/api\/public\/product-video\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\.(mp4|webm|mov)$/;
