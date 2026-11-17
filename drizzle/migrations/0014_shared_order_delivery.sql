CREATE TABLE public.shared_orders (id text PRIMARY KEY, buyer_id uuid NOT NULL REFERENCES public.profiles(id), record jsonb NOT NULL);
GRANT SELECT ON public.shared_orders TO authenticated;
GRANT ALL ON public.shared_orders TO service_role;
ALTER TABLE public.shared_orders ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.shared_order_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id text NOT NULL REFERENCES public.shared_orders(id), vendor_id text NOT NULL, record jsonb NOT NULL);
GRANT SELECT ON public.shared_order_items TO authenticated;
GRANT ALL ON public.shared_order_items TO service_role;
ALTER TABLE public.shared_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read purchased items" ON public.shared_order_items FOR SELECT TO authenticated USING (EXISTS(SELECT 1 FROM public.shared_orders o WHERE o.id=order_id AND o.buyer_id=auth.uid()) OR EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=auth.uid() AND r.role='vendor' AND r.vendor_id=shared_order_items.vendor_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Participants read order contacts" ON public.shared_orders FOR SELECT TO authenticated USING (buyer_id=auth.uid() OR public.has_role(auth.uid(),'admin') OR EXISTS(SELECT 1 FROM public.shared_order_items i JOIN public.user_roles r ON r.vendor_id=i.vendor_id WHERE i.order_id=shared_orders.id AND r.user_id=auth.uid() AND r.role='vendor'));
CREATE OR REPLACE FUNCTION public.create_shared_demo_order(_order jsonb) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE oid text := 'MM-'||gen_random_uuid()::text; line jsonb; p jsonb; shop jsonb; vid text; qty integer; total bigint:=0; prepared jsonb:='[]'; opt jsonb; choice jsonb; at_time text:=now()::text;
BEGIN
 IF auth.uid() IS NULL OR NOT public.account_activity_allowed() THEN RAISE EXCEPTION 'Sign in with an active account'; END IF;
 IF length(trim(_order->>'customer')) NOT BETWEEN 1 AND 200 OR length(trim(_order->>'phone')) NOT BETWEEN 7 AND 50 OR length(trim(_order->>'address')) NOT BETWEEN 1 AND 500 THEN RAISE EXCEPTION 'Provide buyer contact and delivery address'; END IF;
 IF jsonb_array_length(_order->'items') NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Choose items'; END IF;
 FOR line IN SELECT value FROM jsonb_array_elements(_order->'items') LOOP
  SELECT record,vendor_id INTO p,vid FROM public.marketplace_content WHERE kind='product' AND id=line->>'productId' AND NOT deleted;
  IF p IS NULL THEN RAISE EXCEPTION 'This illustrative or removed product cannot be ordered. Choose a seller product.'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.user_roles WHERE role='vendor' AND vendor_id=vid) OR EXISTS(SELECT 1 FROM public.vendor_moderation WHERE vendor_id=vid AND (status='Blocked' OR (status='Suspended' AND (suspended_until IS NULL OR suspended_until>now())))) THEN RAISE EXCEPTION 'Store unavailable'; END IF;
  qty := (line->>'qty')::integer;
  IF qty<1 OR qty>1000 OR qty>(p->>'stock')::integer THEN RAISE EXCEPTION 'Quantity unavailable'; END IF;
  opt:=coalesce(line->'options','{}');
  IF jsonb_typeof(opt)<>'object' OR (SELECT count(*) FROM jsonb_object_keys(opt))<>jsonb_array_length(coalesce(p->'options','[]')) THEN RAISE EXCEPTION 'Choose product options'; END IF;
  FOR choice IN SELECT value FROM jsonb_array_elements(coalesce(p->'options','[]')) LOOP
   IF NOT (choice->'values' ? (opt->>(choice->>'name'))) THEN RAISE EXCEPTION 'Choose valid product options'; END IF;
  END LOOP;
  SELECT record INTO shop FROM public.marketplace_content WHERE kind='store' AND id=vid AND NOT deleted;
  total:=total+(p->>'price')::bigint*qty;
  prepared:=prepared||jsonb_build_array(jsonb_build_object('productId',p->>'id','vendorId',vid,'title',p->>'title','price',(p->>'price')::bigint,'qty',qty,'image',p->'images'->>0,'status','Pending','options',opt,'shop',jsonb_build_object('name',coalesce(shop->>'name',vid),'location',coalesce(shop->>'location',''),'phone',coalesce(shop->>'phone',''))));
 END LOOP;
 INSERT INTO public.shared_orders(id,buyer_id,record) VALUES(oid,auth.uid(),jsonb_build_object('id',oid,'buyerId',auth.uid(),'date',current_date::text,'customer',trim(_order->>'customer'),'phone',trim(_order->>'phone'),'address',trim(_order->>'address'),'payment',CASE WHEN _order->>'payment'='Credit Card' THEN 'Credit Card' ELSE 'Mobile Money' END,'total',total,'paymentStatus','Paid','paymentReference','DEMO-'||gen_random_uuid()::text,'paidAt',at_time,'paymentMode','demo','shared',true));
 FOR line IN SELECT value FROM jsonb_array_elements(prepared) LOOP INSERT INTO public.shared_order_items(order_id,vendor_id,record) VALUES(oid,line->>'vendorId',line); END LOOP;
 RETURN oid;
END $$;
REVOKE ALL ON FUNCTION public.create_shared_demo_order(jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.create_shared_demo_order(jsonb) TO authenticated;
CREATE OR REPLACE FUNCTION public.update_shared_delivery(_id uuid,_status text,_delivery jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE i public.shared_order_items; d jsonb;
BEGIN
 SELECT * INTO i FROM public.shared_order_items WHERE id=_id FOR UPDATE;
 IF NOT public.account_activity_allowed() OR NOT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=auth.uid() AND role='vendor' AND vendor_id=i.vendor_id) THEN RAISE EXCEPTION 'Seller access required'; END IF;
 IF _status NOT IN ('Pending','Processing','Shipped','Delivered') THEN RAISE EXCEPTION 'Invalid status'; END IF;
 d:=jsonb_build_object('driverName',left(trim(coalesce(_delivery->>'driverName','')),150),'phone',left(trim(coalesce(_delivery->>'phone','')),50),'email',left(trim(coalesce(_delivery->>'email','')),200),'address',left(trim(coalesce(_delivery->>'address','')),500),'reference',left(trim(coalesce(_delivery->>'reference','')),100),'note',left(trim(coalesce(_delivery->>'note','')),1000),'updatedAt',now());
 IF _status='Shipped' AND (d->>'driverName'='' OR (d->>'phone'='' AND d->>'email'='') OR d->>'address'='') THEN RAISE EXCEPTION 'Add driver name, phone or email and destination before shipping'; END IF;
 UPDATE public.shared_order_items SET record=record||jsonb_build_object('status',_status,'delivery',d) WHERE id=_id;
END $$;
REVOKE ALL ON FUNCTION public.update_shared_delivery(uuid,text,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.update_shared_delivery(uuid,text,jsonb) TO authenticated;
CREATE OR REPLACE FUNCTION public.review_shared_purchase(_id uuid,_action text,_message text DEFAULT '',_photo text DEFAULT '') RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE i public.shared_order_items; o public.shared_orders;
BEGIN
 SELECT * INTO i FROM public.shared_order_items WHERE id=_id FOR UPDATE;
 SELECT * INTO o FROM public.shared_orders WHERE id=i.order_id;
 IF _action IN ('released','refunded') THEN
  IF NOT public.has_role(auth.uid(),'admin') OR i.record->'claim'->>'status'<>'open' THEN RAISE EXCEPTION 'Admin review required'; END IF;
  UPDATE public.shared_order_items SET record=jsonb_set(record,'{claim,status}',to_jsonb(_action)) WHERE id=_id;
 ELSE
  IF o.buyer_id<>auth.uid() OR auth.uid() IS NULL OR NOT public.account_activity_allowed() THEN RAISE EXCEPTION 'Buyer access required'; END IF;
  IF (o.record->>'paidAt')::timestamptz+interval '48 hours'<=now() OR i.record ? 'buyerConfirmedAt' OR i.record ? 'claim' THEN RAISE EXCEPTION 'Payment is no longer on hold'; END IF;
  IF _action='confirm' THEN UPDATE public.shared_order_items SET record=record||jsonb_build_object('buyerConfirmedAt',now()) WHERE id=_id;
  ELSIF _action='complaint' AND length(trim(_message)) BETWEEN 1 AND 2000 AND length(_photo) BETWEEN 1 AND 50000 AND _photo ~ '^data:image/(webp|png|jpeg);base64,' THEN
   UPDATE public.shared_order_items SET record=record||jsonb_build_object('claim',jsonb_build_object('message',trim(_message),'photo',_photo,'createdAt',now(),'status','open')) WHERE id=_id;
  ELSE RAISE EXCEPTION 'Provide complaint message and photo'; END IF;
 END IF;
END $$;
REVOKE ALL ON FUNCTION public.review_shared_purchase(uuid,text,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.review_shared_purchase(uuid,text,text,text) TO authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_orders, public.shared_order_items;