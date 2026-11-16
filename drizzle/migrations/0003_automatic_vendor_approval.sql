CREATE OR REPLACE FUNCTION public.review_vendor_account(_application_id text, _status text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE application public.vendor_applications;
BEGIN
IF _status NOT IN ('Approved','Rejected') THEN RAISE EXCEPTION 'Invalid review status'; END IF;
SELECT * INTO application FROM public.vendor_applications WHERE id=_application_id FOR UPDATE;
IF NOT FOUND OR application.status <> 'Pending' THEN RAISE EXCEPTION 'Application is not pending'; END IF;
IF _status='Approved' THEN
IF COALESCE(application.record->'vendor'->>'id','')='' THEN RAISE EXCEPTION 'Store is missing'; END IF;
INSERT INTO public.user_roles(user_id,role,vendor_id) VALUES(application.buyer_id,'vendor',application.record->'vendor'->>'id') ON CONFLICT(user_id,role) DO UPDATE SET vendor_id=excluded.vendor_id;
END IF;
UPDATE public.vendor_applications SET status=_status WHERE id=_application_id;
END; $$;
REVOKE ALL ON FUNCTION public.review_vendor_account(text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.review_vendor_account(text,text) TO service_role;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendor_applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;