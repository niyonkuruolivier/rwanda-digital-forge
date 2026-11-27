CREATE OR REPLACE FUNCTION public.product_video_link_allowed(v text) RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = public AS $fn$
SELECT length(v) <= 2048 AND (v ~ '^https://(www\.|m\.)?youtube\.com/(watch\?v=[A-Za-z0-9_-]{11}([&#].*)?|(shorts|embed|live)/[A-Za-z0-9_-]{11}([/?#].*)?)$' OR v ~ '^https://youtu\.be/[A-Za-z0-9_-]{11}([/?#].*)?$' OR v ~ '^https://(www\.)?instagram\.com/(p|reel|reels)/[A-Za-z0-9_-]+/?([?#].*)?$' OR v ~ '^https://(www\.|m\.)?tiktok\.com/@[A-Za-z0-9._]+/video/[0-9]{15,25}/?([?#].*)?$' OR v ~ '^https://((www\.)?vimeo\.com/[0-9]{6,12}|player\.vimeo\.com/video/[0-9]{6,12})/?([?#].*)?$');
$fn$;
CREATE OR REPLACE FUNCTION public.guard_listing_text() RETURNS trigger LANGUAGE plpgsql SET search_path TO public AS $function$
DECLARE v text;
BEGIN
 IF NEW.kind='product' THEN
  IF (TG_OP='INSERT' OR NEW.record->>'title' IS DISTINCT FROM OLD.record->>'title' OR NEW.record->>'description' IS DISTINCT FROM OLD.record->>'description') AND (public.listing_text_blocked(NEW.record->>'title') OR public.listing_text_blocked(NEW.record->>'description')) THEN RAISE EXCEPTION 'Phone numbers, links, emails and outside apps are not allowed in listings'; END IF;
  v:=NEW.record->>'videoUrl';
  IF v IS NOT NULL AND v<>'' AND (TG_OP='INSERT' OR v IS DISTINCT FROM OLD.record->>'videoUrl') AND v !~ ('^/api/public/product-video/' || NEW.vendor_id || '/[A-Za-z0-9_-]+\.(mp4|webm|mov)$') AND NOT public.product_video_link_allowed(v) THEN RAISE EXCEPTION 'Choose a valid YouTube, Instagram, TikTok or Vimeo video link'; END IF;
 ELSIF NEW.kind IN ('store','vendor') THEN
  IF (TG_OP='INSERT' OR NEW.record->>'bio' IS DISTINCT FROM OLD.record->>'bio' OR NEW.record->>'name' IS DISTINCT FROM OLD.record->>'name') AND (public.listing_text_blocked(NEW.record->>'bio') OR public.listing_text_blocked(NEW.record->>'name')) THEN RAISE EXCEPTION 'Phone numbers, links, emails and outside apps are not allowed in shop details'; END IF;
 END IF;
 RETURN NEW;
END $function$;