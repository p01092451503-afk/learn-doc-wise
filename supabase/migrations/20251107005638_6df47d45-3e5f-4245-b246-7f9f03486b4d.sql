-- Create auto_billing_settings table for tenant-specific billing configurations
CREATE TABLE IF NOT EXISTS public.auto_billing_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  billing_email TEXT,
  billing_name TEXT,
  auto_charge_on_limit BOOLEAN NOT NULL DEFAULT false,
  student_addon_price INTEGER NOT NULL DEFAULT 50000,
  storage_addon_price INTEGER NOT NULL DEFAULT 30000,
  ai_token_addon_price INTEGER NOT NULL DEFAULT 20000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Create billing_transactions table for tracking all billing events
CREATE TABLE IF NOT EXISTS public.billing_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL,
  payment_key TEXT,
  transaction_type TEXT NOT NULL, -- 'addon_student', 'addon_storage', 'addon_ai_token', 'subscription'
  amount INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
  payment_method TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auto_billing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for auto_billing_settings
CREATE POLICY "Tenant admins can view their billing settings"
  ON public.auto_billing_settings FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.memberships 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Tenant admins can update their billing settings"
  ON public.auto_billing_settings FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.memberships 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert billing settings"
  ON public.auto_billing_settings FOR INSERT
  WITH CHECK (true);

-- Policies for billing_transactions
CREATE POLICY "Tenant admins can view their billing transactions"
  ON public.billing_transactions FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.memberships 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can manage billing transactions"
  ON public.billing_transactions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_auto_billing_settings_tenant ON public.auto_billing_settings(tenant_id);
CREATE INDEX idx_billing_transactions_tenant ON public.billing_transactions(tenant_id);
CREATE INDEX idx_billing_transactions_order ON public.billing_transactions(order_id);
CREATE INDEX idx_billing_transactions_status ON public.billing_transactions(status);

-- Create trigger for updated_at
CREATE TRIGGER update_auto_billing_settings_updated_at
  BEFORE UPDATE ON public.auto_billing_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_billing_transactions_updated_at
  BEFORE UPDATE ON public.billing_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();