CREATE POLICY "Sellers upload own product videos" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-videos' AND EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'vendor' AND r.vendor_id = (storage.foldername(name))[1]) AND public.account_activity_allowed());

CREATE OR REPLACE FUNCTION public.listing_text_blocked(_t text)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path TO 'public' AS $$
SELECT coalesce(_t,'') ~ '[0-9][0-9 ()./-]{6,}[0-9]'
 OR coalesce(_t,'') ~ '@'
 OR lower(coalesce(_t,'')) ~ '(https?:|www\.|[a-z]\.(com|rw|net|org|me|be|ly|io|co|tv|app|gg|link|info|biz|site|xyz)\M)'
 OR lower(coalesce(_t,'')) ~ '\m(youtube|youtu|instagram|insta|tiktok|tik tok|facebook|messenger|telegram|snapchat|twitter|linkedin|whatsapp|wechat|gmail|yahoo|momo|ussd|telefone|phone|nimero|numero|numéro)\M'
$$;

CREATE OR REPLACE FUNCTION public.guard_listing_text() RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE v text;
BEGIN
  IF NEW.kind = 'product' THEN
    IF (TG_OP = 'INSERT' OR NEW.record->>'title' IS DISTINCT FROM OLD.record->>'title' OR NEW.record->>'description' IS DISTINCT FROM OLD.record->>'description')
       AND (public.listing_text_blocked(NEW.record->>'title') OR public.listing_text_blocked(NEW.record->>'description')) THEN
      RAISE EXCEPTION 'Phone numbers, links, emails and outside apps are not allowed in listings';
    END IF;
    v := NEW.record->>'videoUrl';
    IF v IS NOT NULL AND v <> '' AND (TG_OP = 'INSERT' OR v IS DISTINCT FROM OLD.record->>'videoUrl')
       AND v !~ ('^/api/public/product-video/' || NEW.vendor_id || '/[A-Za-z0-9_-]+\.(mp4|webm|mov)$') THEN
      RAISE EXCEPTION 'Upload the product video file instead of a link';
    END IF;
  ELSIF NEW.kind = 'vendor' THEN
    IF (TG_OP = 'INSERT' OR NEW.record->>'bio' IS DISTINCT FROM OLD.record->>'bio' OR NEW.record->>'name' IS DISTINCT FROM OLD.record->>'name')
       AND (public.listing_text_blocked(NEW.record->>'bio') OR public.listing_text_blocked(NEW.record->>'name')) THEN
      RAISE EXCEPTION 'Phone numbers, links, emails and outside apps are not allowed in shop details';
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER guard_listing_text BEFORE INSERT OR UPDATE ON public.marketplace_content FOR EACH ROW EXECUTE FUNCTION public.guard_listing_text();