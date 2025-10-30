-- Fix security warnings

-- 1. Fix function search path
DROP FUNCTION IF EXISTS public.trigger_usage_collection();

CREATE OR REPLACE FUNCTION public.trigger_usage_collection()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM net.http_post(
    url:='https://uybrpyxyscivkryueble.supabase.co/functions/v1/collect-usage-metrics',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5YnJweXh5c2NpdmtyeXVlYmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MzU2NzUsImV4cCI6MjA3NzMxMTY3NX0.DjygXHrta2mUo_8NbK5l-0qCaZapR2rKBo6kKPRPpqU"}'::jsonb,
    body:='{"trigger": "manual"}'::jsonb
  );
END;
$$;