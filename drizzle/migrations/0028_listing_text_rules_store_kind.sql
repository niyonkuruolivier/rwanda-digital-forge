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
  ELSIF NEW.kind IN ('store','vendor') THEN
    IF (TG_OP = 'INSERT' OR NEW.record->>'bio' IS DISTINCT FROM OLD.record->>'bio' OR NEW.record->>'name' IS DISTINCT FROM OLD.record->>'name')
       AND (public.listing_text_blocked(NEW.record->>'bio') OR public.listing_text_blocked(NEW.record->>'name')) THEN
      RAISE EXCEPTION 'Phone numbers, links, emails and outside apps are not allowed in shop details';
    END IF;
  END IF;
  RETURN NEW;
END $$;