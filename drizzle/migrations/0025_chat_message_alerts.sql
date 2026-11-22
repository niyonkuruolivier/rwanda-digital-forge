CREATE OR REPLACE FUNCTION public.notify_chat_message() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE t public.chat_threads; u uuid;
BEGIN
  SELECT * INTO t FROM public.chat_threads WHERE id=NEW.thread_id;
  IF NEW.sender_id = t.buyer_id THEN
    FOR u IN SELECT user_id FROM public.user_roles WHERE role='vendor' AND vendor_id=t.vendor_id LOOP
      PERFORM public.emit_activity(u, 'New message from '||t.buyer_name, left(NEW.body,120), '/messages?t='||t.id, 'chat');
    END LOOP;
  ELSE
    PERFORM public.emit_activity(t.buyer_id, 'The seller replied', left(NEW.body,120), '/messages?t='||t.id, 'chat');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER notify_chat_message AFTER INSERT ON public.chat_messages FOR EACH ROW EXECUTE FUNCTION public.notify_chat_message();