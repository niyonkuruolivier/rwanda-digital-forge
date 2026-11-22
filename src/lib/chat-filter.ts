// Mirrors public.chat_text_blocked in the database (the database is the final authority).
const WORDS = "zero|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|zéro|deux|trois|quatre|cinq|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|vingt|trente|quarante|cinquante|soixante|cent|cents|mille|zeru|kabiri|gatatu|kane|gatanu|gatandatu|karindwi|umunani|icyenda|icumi|cumi|makumyabiri|ijana|amajana|igihumbi|ibihumbi|miliyoni|bibiri|bitatu|bine|bitanu|bitandatu|birindwi|ibiri|itatu|ine|itanu|rwf|frw|franc|francs|amafaranga|momo|ussd|whatsapp|telefone|phone|numero|numéro|nimero|number";
const SITES = "youtube|youtu|yt|instagram|insta|ig|tiktok|tik tok|facebook|fb|messenger|telegram|snapchat|snap|twitter|threads|linkedin|signal|wechat|imo|google|gmail|yahoo|link|links|website|site|url";
const SITE_RE = new RegExp(`(^|[^\\p{L}])(${SITES})(?=$|[^\\p{L}])`, "iu");
const WORD_RE = new RegExp(`(^|[^\\p{L}])(${WORDS})(?=$|[^\\p{L}])`, "iu");
export function chatTextBlocked(text: string) {
  return /[0-9０-９٠-٩]/.test(text) || WORD_RE.test(text) || SITE_RE.test(text) || text.includes("@") || /(https?:|www\.|[a-z]\.(com|rw|net|org|me|be|ly|io|co|tv|app|gg|link|info|biz|site|xyz)\b)/i.test(text);
}
export const CHAT_RULE = "Numbers, prices, phone numbers, payment codes, emails, links and outside apps like YouTube, Instagram or TikTok are not allowed in chat. Pay only on the website.";
