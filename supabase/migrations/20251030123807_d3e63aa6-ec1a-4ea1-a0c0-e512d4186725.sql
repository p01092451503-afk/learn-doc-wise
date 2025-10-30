-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily usage metrics collection at midnight
SELECT cron.schedule(
  'collect-usage-metrics-daily',
  '0 0 * * *',  -- Every day at midnight
  $$
  SELECT
    net.http_post(
        url:='https://uybrpyxyscivkryueble.supabase.co/functions/v1/collect-usage-metrics',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5YnJweXh5c2NpdmtyeXVlYmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MzU2NzUsImV4cCI6MjA3NzMxMTY3NX0.DjygXHrta2mUo_8NbK5l-0qCaZapR2rKBo6kKPRPpqU"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Schedule usage limit checks every hour
SELECT cron.schedule(
  'check-usage-limits-hourly',
  '0 * * * *',  -- Every hour
  $$
  SELECT
    net.http_post(
        url:='https://uybrpyxyscivkryueble.supabase.co/functions/v1/check-usage-limits',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5YnJweXh5c2NpdmtyeXVlYmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MzU2NzUsImV4cCI6MjA3NzMxMTY3NX0.DjygXHrta2mUo_8NbK5l-0qCaZapR2rKBo6kKPRPpqU"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Create a function to manually trigger usage collection
CREATE OR REPLACE FUNCTION public.trigger_usage_collection()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM net.http_post(
    url:='https://uybrpyxyscivkryueble.supabase.co/functions/v1/collect-usage-metrics',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5YnJweXh5c2NpdmtyeXVlYmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MzU2NzUsImV4cCI6MjA3NzMxMTY3NX0.DjygXHrta2mUo_8NbK5l-0qCaZapR2rKBo6kKPRPpqU"}'::jsonb,
    body:='{"trigger": "manual"}'::jsonb
  );
END;
$$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_usage_metrics_tenant_date 
ON usage_metrics(tenant_id, metric_date DESC);

CREATE INDEX IF NOT EXISTS idx_usage_metrics_created_at 
ON usage_metrics(created_at DESC);