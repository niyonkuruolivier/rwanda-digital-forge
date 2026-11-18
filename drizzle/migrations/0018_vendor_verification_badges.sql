CREATE TABLE public.vendor_verification (
 vendor_id text PRIMARY KEY,
 verified boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vendor_verification TO anon, authenticated;
GRANT INSERT, UPDATE ON public.vendor_verification TO authenticated;
GRANT ALL ON public.vendor_verification TO service_role;
ALTER TABLE public.vendor_verification ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public vendor badge status" ON public.vendor_verification FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Administrator verifies existing sellers" ON public.vendor_verification FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND EXISTS (SELECT 1 FROM public.marketplace_content c WHERE c.kind = 'store' AND c.id = vendor_id AND NOT c.deleted));
CREATE POLICY "Administrator changes seller badge" ON public.vendor_verification FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));