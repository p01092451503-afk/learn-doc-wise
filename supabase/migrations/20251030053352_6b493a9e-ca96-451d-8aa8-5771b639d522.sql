-- Create enum for subscription plans
CREATE TYPE subscription_plan_type AS ENUM ('starter', 'standard', 'professional');

-- Create enum for payment status
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create enum for billing cycle
CREATE TYPE billing_cycle AS ENUM ('monthly', 'yearly');

-- Tenants (기관) table
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  plan subscription_plan_type NOT NULL DEFAULT 'starter',
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_students INTEGER NOT NULL DEFAULT 50,
  max_storage_gb INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tenant subscriptions
CREATE TABLE public.tenant_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan subscription_plan_type NOT NULL,
  billing_cycle billing_cycle NOT NULL DEFAULT 'monthly',
  amount DECIMAL(10, 2) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Usage metrics (사용량 추적)
CREATE TABLE public.usage_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  student_count INTEGER NOT NULL DEFAULT 0,
  storage_used_gb DECIMAL(10, 2) NOT NULL DEFAULT 0,
  bandwidth_gb DECIMAL(10, 2) NOT NULL DEFAULT 0,
  ai_tokens_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, metric_date)
);

-- Payments (결제 정보)
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.tenant_subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT UNIQUE,
  invoice_number TEXT UNIQUE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI usage logs
CREATE TABLE public.ai_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  prompt_text TEXT,
  response_text TEXT,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  model_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Admin access logs
CREATE TABLE public.admin_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- System error logs
CREATE TABLE public.system_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  log_level TEXT NOT NULL,
  message TEXT NOT NULL,
  error_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenants
CREATE POLICY "Admins can view all tenants"
  ON public.tenants FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert tenants"
  ON public.tenants FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tenants"
  ON public.tenants FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tenants"
  ON public.tenants FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for tenant_subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON public.tenant_subscriptions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage subscriptions"
  ON public.tenant_subscriptions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for usage_metrics
CREATE POLICY "Admins can view all usage metrics"
  ON public.usage_metrics FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert usage metrics"
  ON public.usage_metrics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update usage metrics"
  ON public.usage_metrics FOR UPDATE
  USING (true);

-- RLS Policies for payments
CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage payments"
  ON public.payments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for ai_usage_logs
CREATE POLICY "Admins can view all AI logs"
  ON public.ai_usage_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert AI logs"
  ON public.ai_usage_logs FOR INSERT
  WITH CHECK (true);

-- RLS Policies for admin_access_logs
CREATE POLICY "Admins can view access logs"
  ON public.admin_access_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert access logs"
  ON public.admin_access_logs FOR INSERT
  WITH CHECK (true);

-- RLS Policies for system_logs
CREATE POLICY "Admins can view system logs"
  ON public.system_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert system logs"
  ON public.system_logs FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_tenants_subdomain ON public.tenants(subdomain);
CREATE INDEX idx_usage_metrics_tenant_date ON public.usage_metrics(tenant_id, metric_date);
CREATE INDEX idx_payments_tenant ON public.payments(tenant_id);
CREATE INDEX idx_ai_usage_tenant ON public.ai_usage_logs(tenant_id, created_at);
CREATE INDEX idx_admin_logs_admin ON public.admin_access_logs(admin_id, created_at);
CREATE INDEX idx_system_logs_created ON public.system_logs(created_at);

-- Create triggers for updated_at
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.tenant_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();