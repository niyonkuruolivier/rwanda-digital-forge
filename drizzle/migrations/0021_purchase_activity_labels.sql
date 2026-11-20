DO $change$ DECLARE definition text; BEGIN
 definition:=pg_get_functiondef('public.capture_marketplace_activity()'::regprocedure);
 definition:=replace(definition, 'r->''complaint'' IS DISTINCT FROM oldr->''complaint''', 'r->''claim'' IS DISTINCT FROM oldr->''claim''');
 definition:=replace(definition, 'WHEN r->>''status'' IS DISTINCT FROM oldr->>''status'' THEN', 'WHEN r->>''buyerConfirmedAt'' IS DISTINCT FROM oldr->>''buyerConfirmedAt'' THEN ''Buyer confirmed delivery'' WHEN r->>''status'' IS DISTINCT FROM oldr->>''status'' THEN');
 EXECUTE definition;
END $change$;