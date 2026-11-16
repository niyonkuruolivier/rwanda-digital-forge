CREATE TABLE public.product_categories (name text PRIMARY KEY CHECK(length(btrim(name)) BETWEEN 1 AND 80 AND name=btrim(name)), created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.product_categories TO anon,authenticated;
GRANT INSERT ON public.product_categories TO authenticated;
GRANT ALL ON public.product_categories TO service_role;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public product categories" ON public.product_categories FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY "Administrator adds categories" ON public.product_categories FOR INSERT TO authenticated WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE UNIQUE INDEX product_categories_case_unique ON public.product_categories(lower(name));
CREATE OR REPLACE FUNCTION public.enforce_product_category() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.kind='product' AND NOT NEW.deleted THEN
 IF jsonb_typeof(NEW.record->'category') IS DISTINCT FROM 'string' OR NOT ((NEW.record->>'category') IN ('Electronics','Fashion','Home Decor','Art','Services') OR EXISTS(SELECT 1 FROM public.product_categories WHERE name=NEW.record->>'category')) THEN RAISE EXCEPTION 'Choose exactly one available product category'; END IF;
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER enforce_product_category BEFORE INSERT OR UPDATE ON public.marketplace_content FOR EACH ROW EXECUTE FUNCTION public.enforce_product_category();
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_categories;