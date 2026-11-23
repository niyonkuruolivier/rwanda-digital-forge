CREATE TABLE public.staff_permissions (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  task text NOT NULL CHECK (task IN ('applications','vendors','categories','products','orders','complaints','accounts')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, task)
);
GRANT SELECT ON public.staff_permissions TO authenticated;
GRANT ALL ON public.staff_permissions TO service_role;
ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_task(_user_id uuid, _task text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _user_id IS NOT NULL AND (public.has_role(_user_id,'admin') OR EXISTS (SELECT 1 FROM public.staff_permissions WHERE user_id=_user_id AND task=_task))
$$;

CREATE POLICY "Own tasks or admin" ON public.staff_permissions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

ALTER POLICY "Read own profile" ON public.profiles USING (id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_task(auth.uid(),'accounts'));
ALTER POLICY "Read own applications or admin" ON public.vendor_applications USING (buyer_id = auth.uid() OR public.has_task(auth.uid(),'applications'));
ALTER POLICY "Read own vendor moderation or admin" ON public.vendor_moderation USING (public.has_task(auth.uid(),'vendors') OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role='vendor' AND user_roles.vendor_id = vendor_moderation.vendor_id));
ALTER POLICY "Own appeals or admin" ON public.vendor_appeals USING (user_id = auth.uid() OR public.has_task(auth.uid(),'vendors'));
ALTER POLICY "Administrator adds categories" ON public.product_categories WITH CHECK (public.has_task(auth.uid(),'categories'));
ALTER POLICY "Administrator edits category pictures" ON public.product_categories USING (public.has_task(auth.uid(),'categories')) WITH CHECK (public.has_task(auth.uid(),'categories'));
ALTER POLICY "Administrator removes catalog posts" ON public.marketplace_content WITH CHECK (public.has_task(auth.uid(),'products') AND kind = ANY (ARRAY['product','story']) AND deleted AND admin_removed);
ALTER POLICY "Administrator moderates catalog posts" ON public.marketplace_content USING (public.has_task(auth.uid(),'products') AND kind = ANY (ARRAY['product','story'])) WITH CHECK (public.has_task(auth.uid(),'products') AND kind = ANY (ARRAY['product','story']) AND deleted AND admin_removed);
ALTER POLICY "Administrator changes seller badge" ON public.vendor_verification USING (public.has_task(auth.uid(),'vendors')) WITH CHECK (public.has_task(auth.uid(),'vendors'));
ALTER POLICY "Administrator verifies existing sellers" ON public.vendor_verification WITH CHECK (public.has_task(auth.uid(),'vendors') AND EXISTS (SELECT 1 FROM public.marketplace_content c WHERE c.kind='store' AND c.id = vendor_verification.vendor_id AND NOT c.deleted));
ALTER POLICY "Administrator reads all badge rows" ON public.vendor_verification USING (public.has_task(auth.uid(),'vendors'));
CREATE POLICY "Order helpers read purchased items" ON public.shared_order_items FOR SELECT TO authenticated USING (public.has_task(auth.uid(),'orders') OR public.has_task(auth.uid(),'complaints'));
CREATE POLICY "Order helpers read order contacts" ON public.shared_orders FOR SELECT TO authenticated USING (public.has_task(auth.uid(),'orders') OR public.has_task(auth.uid(),'complaints'));

CREATE OR REPLACE FUNCTION public.review_vendor_appeal(_id uuid, _status text, _response text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$ DECLARE v text; BEGIN IF NOT public.has_task(auth.uid(),'vendors') THEN RAISE EXCEPTION 'Administrator required'; END IF; IF _status NOT IN ('Accepted','Rejected') OR length(trim(_response)) NOT BETWEEN 1 AND 2000 THEN RAISE EXCEPTION 'Decision and response required'; END IF; SELECT vendor_id INTO v FROM public.vendor_appeals WHERE id=_id AND status='Pending' FOR UPDATE; IF v IS NULL THEN RAISE EXCEPTION 'Pending appeal not found'; END IF; UPDATE public.vendor_appeals SET status=_status,response=trim(_response) WHERE id=_id; IF _status='Accepted' THEN UPDATE public.vendor_moderation SET status='Active',reason='',suspended_until=NULL,updated_by=auth.uid(),updated_at=now() WHERE vendor_id=v; END IF; END; $function$;

CREATE OR REPLACE FUNCTION public.review_shared_purchase(_id uuid, _action text, _message text DEFAULT '', _photo text DEFAULT '') RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE i public.shared_order_items; o public.shared_orders;
BEGIN
 SELECT * INTO i FROM public.shared_order_items WHERE id=_id FOR UPDATE;
 SELECT * INTO o FROM public.shared_orders WHERE id=i.order_id;
 IF _action IN ('released','refunded') THEN
  IF NOT public.has_task(auth.uid(),'complaints') OR i.record->'claim'->>'status'<>'open' THEN RAISE EXCEPTION 'Admin review required'; END IF;
  UPDATE public.shared_order_items SET record=jsonb_set(record,'{claim,status}',to_jsonb(_action)) WHERE id=_id;
 ELSE
  IF o.buyer_id<>auth.uid() OR auth.uid() IS NULL OR NOT public.account_activity_allowed() THEN RAISE EXCEPTION 'Buyer access required'; END IF;
  IF (o.record->>'paidAt')::timestamptz+interval '48 hours'<=now() OR i.record ? 'buyerConfirmedAt' OR i.record ? 'claim' THEN RAISE EXCEPTION 'Payment is no longer on hold'; END IF;
  IF _action='confirm' THEN UPDATE public.shared_order_items SET record=record||jsonb_build_object('buyerConfirmedAt',now()) WHERE id=_id;
  ELSIF _action='complaint' AND length(trim(_message)) BETWEEN 1 AND 2000 AND length(_photo) BETWEEN 1 AND 50000 AND _photo ~ '^data:image/(webp|png|jpeg);base64,' THEN
   UPDATE public.shared_order_items SET record=record||jsonb_build_object('claim',jsonb_build_object('message',trim(_message),'photo',_photo,'createdAt',now(),'status','open')) WHERE id=_id;
  ELSE RAISE EXCEPTION 'Provide complaint message and photo'; END IF;
 END IF;
END $function$;