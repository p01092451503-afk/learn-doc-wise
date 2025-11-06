-- Create operator tenant access table
CREATE TABLE IF NOT EXISTS public.operator_tenant_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(operator_id, tenant_id)
);

-- Add index for faster lookups
CREATE INDEX idx_operator_tenant_access_operator ON public.operator_tenant_access(operator_id);
CREATE INDEX idx_operator_tenant_access_tenant ON public.operator_tenant_access(tenant_id);
CREATE INDEX idx_operator_tenant_access_active ON public.operator_tenant_access(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.operator_tenant_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Operators can view their own access"
  ON public.operator_tenant_access
  FOR SELECT
  USING (auth.uid() = operator_id OR is_operator(auth.uid()));

CREATE POLICY "Operators can manage tenant access"
  ON public.operator_tenant_access
  FOR ALL
  USING (is_operator(auth.uid()));

-- Function to check if operator has access to tenant
CREATE OR REPLACE FUNCTION public.operator_has_tenant_access(_operator_id UUID, _tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.operator_tenant_access
    WHERE operator_id = _operator_id
      AND tenant_id = _tenant_id
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  ) OR is_operator(_operator_id);
$$;

-- Add trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_operator_tenant_access_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_operator_tenant_access_updated_at
  BEFORE UPDATE ON public.operator_tenant_access
  FOR EACH ROW
  EXECUTE FUNCTION public.update_operator_tenant_access_updated_at();