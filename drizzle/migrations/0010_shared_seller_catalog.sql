CREATE TABLE public.marketplace_content (
 kind text NOT NULL CHECK(kind IN ('store','product','story')),
 id text NOT NULL,
 vendor_id text NOT NULL,
 record jsonb NOT NULL CHECK(jsonb_typeof(record)='object'),
 deleted boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(kind,id),
 CHECK(record->>'id'=id),
 CHECK(kind='store' OR record->>'vendorId'=vendor_id),
 CHECK(kind<>'store' OR id=vendor_id)
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.marketplace_content TO authenticated;
GRANT SELECT ON public.marketplace_content TO anon;
GRANT ALL ON public.marketplace_content TO service_role;
ALTER TABLE public.marketplace_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public catalog content" ON public.marketplace_content FOR SELECT TO anon,authenticated USING (true);
CREATE POLICY "Active seller inserts own content" ON public.marketplace_content FOR INSERT TO authenticated WITH CHECK(public.account_activity_allowed() AND EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=auth.uid() AND r.role='vendor' AND r.vendor_id=marketplace_content.vendor_id));
CREATE POLICY "Active seller updates own content" ON public.marketplace_content FOR UPDATE TO authenticated USING(public.account_activity_allowed() AND EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=auth.uid() AND r.role='vendor' AND r.vendor_id=marketplace_content.vendor_id)) WITH CHECK(public.account_activity_allowed() AND EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=auth.uid() AND r.role='vendor' AND r.vendor_id=marketplace_content.vendor_id));
CREATE INDEX marketplace_content_vendor_idx ON public.marketplace_content(vendor_id,kind);
CREATE OR REPLACE FUNCTION public.validate_marketplace_content() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE expected_vendor text;
BEGIN
 IF TG_OP='UPDATE' AND (NEW.id<>OLD.id OR NEW.kind<>OLD.kind OR NEW.vendor_id<>OLD.vendor_id) THEN RAISE EXCEPTION 'Content ownership cannot change'; END IF;
 IF NEW.kind='store' THEN
   NEW.record := NEW.record - 'blockedReason' - 'suspendedUntil' - 'status';
   IF TG_OP='UPDATE' THEN NEW.record := NEW.record || jsonb_build_object('rating',OLD.record->'rating','joined',OLD.record->'joined'); END IF;
 END IF;
 IF NEW.kind='product' AND NEW.id ~ '^p([1-9]|1[0-2])$' THEN
   expected_vendor := CASE WHEN NEW.id IN ('p1','p2','p3') THEN 'kigali-tech' WHEN NEW.id IN ('p4','p5','p12') THEN 'imigongo-studio' WHEN NEW.id IN ('p6','p7','p8') THEN 'urban-threads' ELSE 'nest-and-weave' END;
   IF NEW.vendor_id<>expected_vendor THEN RAISE EXCEPTION 'Cannot edit another store product'; END IF;
 END IF;
 NEW.updated_at:=now(); RETURN NEW;
END; $$;
CREATE TRIGGER validate_marketplace_content BEFORE INSERT OR UPDATE ON public.marketplace_content FOR EACH ROW EXECUTE FUNCTION public.validate_marketplace_content();
INSERT INTO public.marketplace_content(kind,id,vendor_id,record)
 SELECT 'store',record->'vendor'->>'id',record->'vendor'->>'id', (record->'vendor')-'blockedReason'-'suspendedUntil'-'status'
 FROM public.vendor_applications WHERE status='Approved' AND COALESCE(record->'vendor'->>'id','')<>'' ON CONFLICT DO NOTHING;
CREATE OR REPLACE FUNCTION public.publish_approved_store() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.status='Approved' AND OLD.status IS DISTINCT FROM 'Approved' THEN
 INSERT INTO public.marketplace_content(kind,id,vendor_id,record) VALUES('store',NEW.record->'vendor'->>'id',NEW.record->'vendor'->>'id',(NEW.record->'vendor')-'blockedReason'-'suspendedUntil'-'status') ON CONFLICT DO NOTHING;
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER publish_approved_store AFTER UPDATE ON public.vendor_applications FOR EACH ROW EXECUTE FUNCTION public.publish_approved_store();
ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_content;