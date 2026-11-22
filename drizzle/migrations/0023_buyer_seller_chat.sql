CREATE OR REPLACE FUNCTION public.chat_text_blocked(_t text) RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path=public AS $$
SELECT _t ~ '[0-9０-９٠-٩]'
 OR lower(_t) ~ '\m(zero|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|zéro|zero|deux|trois|quatre|cinq|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|vingt|trente|quarante|cinquante|soixante|cent|cents|mille|zeru|kabiri|gatatu|kane|gatanu|gatandatu|karindwi|umunani|icyenda|icumi|cumi|makumyabiri|ijana|amajana|igihumbi|ibihumbi|miliyoni|bibiri|bitatu|bine|bitanu|bitandatu|birindwi|ibiri|itatu|ine|itanu|rwf|frw|franc|francs|amafaranga|momo|ussd|whatsapp|telefone|phone|numero|numéro|nimero|number)\M'
 OR _t ~ '[@]' OR lower(_t) ~ '(https?:|www\.|\.com\M|\.rw\M)'
$$;
CREATE TABLE public.chat_threads(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), buyer_id uuid NOT NULL, buyer_name text NOT NULL DEFAULT '', vendor_id text NOT NULL, product_id text NOT NULL DEFAULT '', product_title text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now(), last_at timestamptz NOT NULL DEFAULT now(), UNIQUE(buyer_id,vendor_id));
GRANT SELECT,INSERT ON public.chat_threads TO authenticated;
GRANT ALL ON public.chat_threads TO service_role;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.chat_messages(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), thread_id uuid NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE, sender_id uuid NOT NULL, body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000), created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.can_access_chat(_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
SELECT auth.uid() IS NOT NULL AND EXISTS(SELECT 1 FROM public.chat_threads t WHERE t.id=_id AND (t.buyer_id=auth.uid() OR public.has_role(auth.uid(),'admin') OR (public.account_activity_allowed() AND EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=auth.uid() AND r.role='vendor' AND r.vendor_id=t.vendor_id)))) $$;
CREATE POLICY "Participants read threads" ON public.chat_threads FOR SELECT TO authenticated USING (public.can_access_chat(id));
CREATE POLICY "Buyer opens thread" ON public.chat_threads FOR INSERT TO authenticated WITH CHECK (buyer_id=auth.uid() AND NOT EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=auth.uid() AND r.role='vendor' AND r.vendor_id=chat_threads.vendor_id));
CREATE POLICY "Participants read messages" ON public.chat_messages FOR SELECT TO authenticated USING (public.can_access_chat(thread_id));
CREATE POLICY "Participants send messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (sender_id=auth.uid() AND public.can_access_chat(thread_id) AND NOT public.chat_text_blocked(body));
CREATE OR REPLACE FUNCTION public.chat_thread_defaults() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN NEW.buyer_name := COALESCE(NULLIF((SELECT name FROM public.profiles WHERE id=NEW.buyer_id),''),'Buyer'); NEW.product_title := left(NEW.product_title,120); RETURN NEW; END $$;
CREATE TRIGGER chat_thread_defaults BEFORE INSERT ON public.chat_threads FOR EACH ROW EXECUTE FUNCTION public.chat_thread_defaults();
CREATE OR REPLACE FUNCTION public.chat_touch_thread() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN UPDATE public.chat_threads SET last_at=now() WHERE id=NEW.thread_id; RETURN NEW; END $$;
CREATE TRIGGER chat_touch_thread AFTER INSERT ON public.chat_messages FOR EACH ROW EXECUTE FUNCTION public.chat_touch_thread();
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;