
CREATE TABLE public.performance_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name text NOT NULL,
  metric_value numeric,
  page_url text,
  tenant_id uuid REFERENCES public.tenants(id),
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.performance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert performance logs"
  ON public.performance_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Operators can read performance logs"
  ON public.performance_logs
  FOR SELECT
  TO authenticated
  USING (public.is_operator(auth.uid()));

CREATE INDEX idx_performance_logs_metric_name ON public.performance_logs(metric_name);
CREATE INDEX idx_performance_logs_created_at ON public.performance_logs(created_at DESC);
