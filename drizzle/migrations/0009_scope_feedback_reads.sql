DROP POLICY "Public feedback" ON public.customer_feedback;
REVOKE SELECT ON public.customer_feedback FROM anon;
CREATE POLICY "Read own feedback or administrator" ON public.customer_feedback FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE FUNCTION public.public_customer_feedback(_target_type text,_target_id text) RETURNS TABLE(id uuid,author_name text,author_photo text,message text,photos jsonb,created_at timestamptz) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT f.id,f.author_name,f.author_photo,f.message,f.photos,f.created_at FROM public.customer_feedback f WHERE _target_type IN ('product','shop') AND length(_target_id) BETWEEN 1 AND 200 AND f.target_type=_target_type AND f.target_id=_target_id ORDER BY f.created_at DESC LIMIT 100; $$;
REVOKE ALL ON FUNCTION public.public_customer_feedback(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_customer_feedback(text,text) TO anon,authenticated;
COMMENT ON FUNCTION public.public_customer_feedback(text,text) IS 'Public product/shop feedback projection only; excludes private user identity and limits results to one target.';