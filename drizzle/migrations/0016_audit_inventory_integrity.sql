CREATE TABLE public.inventory_history (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_id text NOT NULL, vendor_id text NOT NULL, previous_stock integer NOT NULL, new_stock integer NOT NULL, reason text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.inventory_history TO authenticated;
GRANT ALL ON public.inventory_history TO service_role;
ALTER TABLE public.inventory_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner or admin inventory history" ON public.inventory_history FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id=auth.uid() AND r.role='vendor' AND r.vendor_id=inventory_history.vendor_id));
CREATE INDEX inventory_history_vendor_time_idx ON public.inventory_history(vendor_id,created_at DESC);
CREATE INDEX IF NOT EXISTS shared_orders_buyer_idx ON public.shared_orders(buyer_id);
CREATE INDEX IF NOT EXISTS shared_order_items_order_idx ON public.shared_order_items(order_id);
CREATE INDEX IF NOT EXISTS shared_order_items_vendor_idx ON public.shared_order_items(vendor_id);
CREATE OR REPLACE FUNCTION public.reserve_order_inventory() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p public.marketplace_content; quantity integer; stock integer;
BEGIN
 SELECT * INTO p FROM public.marketplace_content WHERE kind='product' AND id=NEW.record->>'productId' AND NOT deleted FOR UPDATE;
 IF NOT FOUND OR p.vendor_id<>NEW.vendor_id THEN RAISE EXCEPTION 'Product unavailable'; END IF;
 quantity:=(NEW.record->>'qty')::integer; stock:=(p.record->>'stock')::integer;
 IF quantity IS NULL OR stock IS NULL OR quantity<1 OR quantity>stock THEN RAISE EXCEPTION 'Quantity unavailable'; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.shared_orders WHERE id=NEW.order_id AND record->>'paymentStatus'='Paid') THEN RAISE EXCEPTION 'Order payment required'; END IF;
 UPDATE public.marketplace_content SET record=jsonb_set(record,'{stock}',to_jsonb(stock-quantity)) WHERE kind='product' AND id=p.id;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.reserve_order_inventory() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER reserve_order_inventory BEFORE INSERT ON public.shared_order_items FOR EACH ROW EXECUTE FUNCTION public.reserve_order_inventory();
CREATE OR REPLACE FUNCTION public.record_inventory_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.kind='product' AND NEW.record->>'stock' IS DISTINCT FROM OLD.record->>'stock' THEN
 INSERT INTO public.inventory_history(product_id,vendor_id,previous_stock,new_stock,reason) VALUES(NEW.id,NEW.vendor_id,(OLD.record->>'stock')::integer,(NEW.record->>'stock')::integer,CASE WHEN pg_trigger_depth()>1 THEN 'Order reservation' ELSE 'Seller stock adjustment' END);
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.record_inventory_change() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER record_inventory_change AFTER UPDATE ON public.marketplace_content FOR EACH ROW EXECUTE FUNCTION public.record_inventory_change();
CREATE OR REPLACE FUNCTION public.guard_shared_item_update() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE old_status text:=OLD.record->>'status'; new_status text:=NEW.record->>'status';
BEGIN
 IF NEW.record->'claim'->>'status' IN ('released','refunded') AND OLD.record->'claim'->>'status' IS DISTINCT FROM 'open' THEN RAISE EXCEPTION 'Open complaint required'; END IF;
 IF old_status IS DISTINCT FROM new_status THEN
 IF array_position(ARRAY['Pending','Processing','Shipped','Delivered'],new_status) IS NULL OR array_position(ARRAY['Pending','Processing','Shipped','Delivered'],new_status)<array_position(ARRAY['Pending','Processing','Shipped','Delivered'],old_status) THEN RAISE EXCEPTION 'Delivery status cannot move backwards'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER guard_shared_item_update BEFORE UPDATE ON public.shared_order_items FOR EACH ROW EXECUTE FUNCTION public.guard_shared_item_update();
REVOKE EXECUTE ON FUNCTION public.review_vendor_appeal(uuid,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.review_vendor_appeal(uuid,text,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.publish_approved_store() FROM PUBLIC,anon,authenticated;