CREATE TABLE public.activity_notifications (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid, title text NOT NULL, detail text NOT NULL DEFAULT '', href text NOT NULL, kind text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.activity_notifications TO authenticated;
GRANT ALL ON public.activity_notifications TO service_role;
ALTER TABLE public.activity_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read public activity or own alerts" ON public.activity_notifications FOR SELECT TO authenticated USING (user_id IS NULL OR user_id=auth.uid());
CREATE INDEX activity_notifications_recipient_time ON public.activity_notifications(user_id,created_at DESC);
CREATE TABLE public.notification_reads (user_id uuid NOT NULL DEFAULT auth.uid(), notification_id uuid NOT NULL REFERENCES public.activity_notifications(id) ON DELETE CASCADE, read_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,notification_id));
GRANT SELECT,INSERT ON public.notification_reads TO authenticated;
GRANT ALL ON public.notification_reads TO service_role;
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own notification receipts" ON public.notification_reads FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE POLICY "Mark visible alerts read" ON public.notification_reads FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.activity_notifications n WHERE n.id=notification_id AND (n.user_id IS NULL OR n.user_id=auth.uid())));
CREATE OR REPLACE FUNCTION public.emit_activity(_user uuid,_title text,_detail text,_href text,_kind text) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$ INSERT INTO public.activity_notifications(user_id,title,detail,href,kind) VALUES(_user,left(_title,200),left(coalesce(_detail,''),500),_href,_kind); $$;
REVOKE ALL ON FUNCTION public.emit_activity(uuid,text,text,text,text) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.capture_marketplace_activity() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE n jsonb:=to_jsonb(NEW); o jsonb:='{}'; r jsonb; oldr jsonb; recipient uuid; buyer uuid; vid text; href text; headline text; details text; eventkind text:=TG_TABLE_NAME; notify_admin boolean:=false;
BEGIN
 IF TG_OP='UPDATE' THEN o:=to_jsonb(OLD); END IF;
 r:=coalesce(n->'record','{}'); oldr:=coalesce(o->'record','{}');
 IF TG_TABLE_NAME='marketplace_content' THEN
  IF (n->>'deleted')::boolean THEN RETURN NEW; END IF;
  vid:=n->>'vendor_id';
  IF n->>'kind'='product' THEN
   href:='/products/'||(n->>'id'); details:=r->>'title';
   IF TG_OP='INSERT' THEN headline:='New product';
   ELSIF r->>'price' IS DISTINCT FROM oldr->>'price' AND (r->>'compareAt')::numeric>(r->>'price')::numeric THEN headline:='Product discount updated';
   ELSE RETURN NEW; END IF;
  ELSIF n->>'kind'='story' THEN
   href:='/vendors/'||vid; details:=r->>'title';
   IF TG_OP='INSERT' OR r->>'liveSince' IS DISTINCT FROM oldr->>'liveSince' OR r->>'isLive' IS DISTINCT FROM oldr->>'isLive' THEN
    headline:=CASE WHEN r->>'isLive'='true' THEN 'Store shared a live link' ELSE 'Store shared a deal' END;
   ELSE RETURN NEW; END IF;
  ELSE RETURN NEW; END IF;
  PERFORM public.emit_activity(NULL,headline,details,href,'catalog'); RETURN NEW;
 ELSIF TG_TABLE_NAME='shared_order_items' THEN
  IF TG_OP='UPDATE' AND r=oldr THEN RETURN NEW; END IF;
  SELECT buyer_id INTO buyer FROM public.shared_orders WHERE id=n->>'order_id';
  headline:=CASE WHEN TG_OP='INSERT' THEN 'Order placed · demo payment' WHEN r->'complaint' IS DISTINCT FROM oldr->'complaint' THEN 'Order complaint updated' WHEN r->>'status' IS DISTINCT FROM oldr->>'status' THEN 'Order '||coalesce(r->>'status','updated') ELSE 'Delivery details updated' END;
  details:=coalesce(r->>'title','Order item')||' · '||(n->>'order_id');
  PERFORM public.emit_activity(buyer,headline,details,'/orders','order');
  FOR recipient IN SELECT DISTINCT user_id FROM public.user_roles WHERE role='vendor' AND vendor_id=n->>'vendor_id' LOOP
   IF recipient IS DISTINCT FROM buyer THEN PERFORM public.emit_activity(recipient,headline,details,'/dashboard','order'); END IF;
  END LOOP;
  notify_admin:=true;
 ELSIF TG_TABLE_NAME='vendor_applications' THEN
  IF TG_OP='UPDATE' AND n->>'status' IS NOT DISTINCT FROM o->>'status' THEN RETURN NEW; END IF;
  headline:='Vendor application '||lower(n->>'status'); details:='Open your application for details';
  PERFORM public.emit_activity((n->>'buyer_id')::uuid,headline,details,'/become-vendor','account'); notify_admin:=true;
 ELSIF TG_TABLE_NAME='vendor_appeals' THEN
  IF TG_OP='UPDATE' AND n->>'status' IS NOT DISTINCT FROM o->>'status' THEN RETURN NEW; END IF;
  headline:='Vendor appeal '||lower(n->>'status'); details:='Open your account for details';
  PERFORM public.emit_activity((n->>'user_id')::uuid,headline,details,'/account','account'); notify_admin:=true;
 ELSIF TG_TABLE_NAME IN ('vendor_moderation','vendor_verification') THEN
  IF TG_OP='UPDATE' AND n->>'status' IS NOT DISTINCT FROM o->>'status' AND n->>'verified' IS NOT DISTINCT FROM o->>'verified' AND n->>'suspended_until' IS NOT DISTINCT FROM o->>'suspended_until' THEN RETURN NEW; END IF;
  headline:=CASE WHEN TG_TABLE_NAME='vendor_verification' THEN CASE WHEN n->>'verified'='true' THEN 'Your store is verified' ELSE 'Store verification removed' END ELSE 'Store access '||lower(n->>'status') END;
  details:='Open your account for details';
  FOR recipient IN SELECT DISTINCT user_id FROM public.user_roles WHERE role='vendor' AND vendor_id=n->>'vendor_id' LOOP PERFORM public.emit_activity(recipient,headline,details,'/account','account'); END LOOP;
  notify_admin:=true;
 ELSIF TG_TABLE_NAME='customer_feedback' THEN
  headline:='New customer feedback'; details:='A customer left feedback';
  IF n->>'target_type'='shop' THEN vid:=n->>'target_id'; href:='/vendors/'||vid;
  ELSE SELECT vendor_id INTO vid FROM public.marketplace_content WHERE kind='product' AND id=n->>'target_id'; href:='/products/'||(n->>'target_id'); END IF;
  FOR recipient IN SELECT DISTINCT user_id FROM public.user_roles WHERE role='vendor' AND vendor_id=vid LOOP PERFORM public.emit_activity(recipient,headline,details,href,'feedback'); END LOOP;
  notify_admin:=true;
 ELSIF TG_TABLE_NAME='store_ratings' THEN
  headline:='Store rating updated'; details:='A visitor rated your store'; href:='/vendors/'||(n->>'vendor_id');
  FOR recipient IN SELECT DISTINCT user_id FROM public.user_roles WHERE role='vendor' AND vendor_id=n->>'vendor_id' LOOP PERFORM public.emit_activity(recipient,headline,details,href,'feedback'); END LOOP;
  RETURN NEW;
 END IF;
 IF notify_admin THEN FOR recipient IN SELECT DISTINCT user_id FROM public.user_roles WHERE role='admin' LOOP PERFORM public.emit_activity(recipient,headline,details,'/admin',eventkind); END LOOP; END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.capture_marketplace_activity() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER activity_catalog AFTER INSERT OR UPDATE ON public.marketplace_content FOR EACH ROW EXECUTE FUNCTION public.capture_marketplace_activity();
CREATE TRIGGER activity_orders AFTER INSERT OR UPDATE ON public.shared_order_items FOR EACH ROW EXECUTE FUNCTION public.capture_marketplace_activity();
CREATE TRIGGER activity_applications AFTER INSERT OR UPDATE ON public.vendor_applications FOR EACH ROW EXECUTE FUNCTION public.capture_marketplace_activity();
CREATE TRIGGER activity_appeals AFTER INSERT OR UPDATE ON public.vendor_appeals FOR EACH ROW EXECUTE FUNCTION public.capture_marketplace_activity();
CREATE TRIGGER activity_moderation AFTER INSERT OR UPDATE ON public.vendor_moderation FOR EACH ROW EXECUTE FUNCTION public.capture_marketplace_activity();
CREATE TRIGGER activity_verification AFTER INSERT OR UPDATE ON public.vendor_verification FOR EACH ROW EXECUTE FUNCTION public.capture_marketplace_activity();
CREATE TRIGGER activity_feedback AFTER INSERT ON public.customer_feedback FOR EACH ROW EXECUTE FUNCTION public.capture_marketplace_activity();
CREATE TRIGGER activity_ratings AFTER INSERT OR UPDATE ON public.store_ratings FOR EACH ROW EXECUTE FUNCTION public.capture_marketplace_activity();
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_notifications,public.notification_reads;