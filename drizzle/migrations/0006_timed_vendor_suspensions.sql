ALTER TABLE public.vendor_moderation ADD COLUMN suspended_until timestamptz;
CREATE OR REPLACE FUNCTION public.vendor_trading_statuses() RETURNS TABLE(vendor_id text,status text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT vendor_id, CASE WHEN status='Suspended' AND suspended_until <= now() THEN 'Active' ELSE status END FROM public.vendor_moderation; $$;
REVOKE ALL ON FUNCTION public.vendor_trading_statuses() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.vendor_trading_statuses() TO anon,authenticated,service_role;