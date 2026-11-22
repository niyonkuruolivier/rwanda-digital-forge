CREATE OR REPLACE FUNCTION public.chat_text_blocked(_t text)
 RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path TO 'public'
AS $function$
SELECT _t ~ '[0-9０-９٠-٩]'
 OR lower(_t) ~ '\m(zero|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|zéro|deux|trois|quatre|cinq|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|vingt|trente|quarante|cinquante|soixante|cent|cents|mille|zeru|kabiri|gatatu|kane|gatanu|gatandatu|karindwi|umunani|icyenda|icumi|cumi|makumyabiri|ijana|amajana|igihumbi|ibihumbi|miliyoni|bibiri|bitatu|bine|bitanu|bitandatu|birindwi|ibiri|itatu|ine|itanu|rwf|frw|franc|francs|amafaranga|momo|ussd|whatsapp|telefone|phone|numero|numéro|nimero|number)\M'
 OR lower(_t) ~ '\m(youtube|youtu|yt|instagram|insta|ig|tiktok|tik tok|facebook|fb|messenger|telegram|snapchat|snap|twitter|threads|linkedin|signal|wechat|imo|google|gmail|yahoo|link|links|website|site|url)\M'
 OR _t ~ '[@]' OR lower(_t) ~ '(https?:|www\.|[a-z]\.(com|rw|net|org|me|be|ly|io|co|tv|app|gg|link|info|biz|site|xyz)\M)'
$function$;