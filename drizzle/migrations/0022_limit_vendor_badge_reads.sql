DROP POLICY IF EXISTS "Public vendor badge status" ON public.vendor_verification;
CREATE POLICY "Public verified badges" ON public.vendor_verification FOR SELECT TO anon, authenticated USING (verified = true);
CREATE POLICY "Administrator reads all badge rows" ON public.vendor_verification FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));