CREATE OR REPLACE FUNCTION public.publish_product_status() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $fn$
DECLARE sid text; cover text;
BEGIN
 IF NEW.kind <> 'product' OR NEW.deleted THEN RETURN NEW; END IF;
 cover:=NEW.record->'images'->>0;
 IF coalesce(cover,'')='' THEN RETURN NEW; END IF;
 sid:='product-status-'||NEW.id;
 INSERT INTO public.marketplace_content(kind,id,vendor_id,record) VALUES ('story',sid,NEW.vendor_id,jsonb_build_object('id',sid,'vendorId',NEW.vendor_id,'title',left(NEW.record->>'title',80),'image',cover,'productId',NEW.id,'isLive',false,'createdAt',floor(extract(epoch FROM now())*1000)::bigint)) ON CONFLICT (kind,id) DO NOTHING;
 RETURN NEW;
END $fn$;
CREATE TRIGGER auto_product_status AFTER INSERT ON public.marketplace_content FOR EACH ROW EXECUTE FUNCTION public.publish_product_status();