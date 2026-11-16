CREATE TABLE public.vendor_applications (id text PRIMARY KEY, buyer_id uuid NOT NULL REFERENCES public.profiles(id), record jsonb NOT NULL, status text NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending','Approved','Rejected')), submitted_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT ON public.vendor_applications TO authenticated;
GRANT ALL ON public.vendor_applications TO service_role;
ALTER TABLE public.vendor_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own applications or admin" ON public.vendor_applications FOR SELECT TO authenticated USING(buyer_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Submit own pending application" ON public.vendor_applications FOR INSERT TO authenticated WITH CHECK(buyer_id=auth.uid() AND status='Pending');
CREATE UNIQUE INDEX one_pending_vendor_application ON public.vendor_applications(buyer_id) WHERE status='Pending';