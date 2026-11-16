CREATE TABLE public.vendor_moderation (vendor_id text PRIMARY KEY, status text NOT NULL DEFAULT 'Active' CHECK(status IN ('Active','Blocked','Suspended')), reason text NOT NULL DEFAULT '', updated_at timestamptz NOT NULL DEFAULT now(), updated_by uuid NOT NULL, CHECK(status='Active' OR length(btrim(reason))>0));
GRANT SELECT ON public.vendor_moderation TO authenticated;
GRANT ALL ON public.vendor_moderation TO service_role;
ALTER TABLE public.vendor_moderation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own vendor moderation or admin" ON public.vendor_moderation FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin') OR EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=auth.uid() AND role='vendor' AND vendor_id=vendor_moderation.vendor_id));
CREATE OR REPLACE FUNCTION public.vendor_trading_statuses() RETURNS TABLE(vendor_id text,status text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT vendor_id,status FROM public.vendor_moderation; $$;
REVOKE ALL ON FUNCTION public.vendor_trading_statuses() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.vendor_trading_statuses() TO anon,authenticated,service_role;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendor_moderation;