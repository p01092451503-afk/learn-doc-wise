-- Create billing_history table for tracking tenant billing
CREATE TABLE IF NOT EXISTS public.billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  billing_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  plan_name TEXT NOT NULL,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_billing_history_tenant_id ON public.billing_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_billing_date ON public.billing_history(billing_date DESC);
CREATE INDEX IF NOT EXISTS idx_billing_history_status ON public.billing_history(status);

-- Enable RLS
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Tenant admins can view their billing history"
ON public.billing_history
FOR SELECT
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.memberships
    WHERE user_id = auth.uid()
    AND role = 'admin'
    AND is_active = true
  )
  OR is_platform_operator(auth.uid())
);

CREATE POLICY "System can insert billing records"
ON public.billing_history
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update billing records"
ON public.billing_history
FOR UPDATE
USING (true);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_billing_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_billing_history_updated_at
BEFORE UPDATE ON public.billing_history
FOR EACH ROW
EXECUTE FUNCTION update_billing_history_updated_at();