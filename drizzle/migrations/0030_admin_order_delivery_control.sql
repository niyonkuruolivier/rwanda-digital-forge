CREATE OR REPLACE FUNCTION public.update_shared_delivery(_id uuid, _status text, _delivery jsonb)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE i public.shared_order_items; d jsonb;
BEGIN
 SELECT * INTO i FROM public.shared_order_items WHERE id=_id FOR UPDATE;
 IF i.id IS NULL THEN RAISE EXCEPTION 'Order item not found'; END IF;
 IF NOT public.has_task(auth.uid(),'orders') AND (NOT public.account_activity_allowed() OR NOT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=auth.uid() AND role='vendor' AND vendor_id=i.vendor_id)) THEN RAISE EXCEPTION 'Seller or admin access required'; END IF;
 IF _status NOT IN ('Pending','Processing','Shipped','Delivered') THEN RAISE EXCEPTION 'Invalid status'; END IF;
 d:=jsonb_build_object('driverName',left(trim(coalesce(_delivery->>'driverName','')),150),'phone',left(trim(coalesce(_delivery->>'phone','')),50),'email',left(trim(coalesce(_delivery->>'email','')),200),'address',left(trim(coalesce(_delivery->>'address','')),500),'reference',left(trim(coalesce(_delivery->>'reference','')),100),'note',left(trim(coalesce(_delivery->>'note','')),1000),'updatedAt',now());
 IF _status='Shipped' AND (d->>'driverName'='' OR (d->>'phone'='' AND d->>'email'='') OR d->>'address'='') THEN RAISE EXCEPTION 'Add driver name, phone or email and destination before shipping'; END IF;
 UPDATE public.shared_order_items SET record=record||jsonb_build_object('status',_status,'delivery',d) WHERE id=_id;
END $function$;