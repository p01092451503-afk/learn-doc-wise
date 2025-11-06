-- Create contracts table for managing customer contracts
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  contract_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  business_registration_number TEXT,
  representative_name TEXT NOT NULL,
  representative_contact TEXT NOT NULL,
  representative_email TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'standard', 'pro', 'professional', 'enterprise', 'enterprise_hrd')),
  contract_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  contract_start_date DATE NOT NULL,
  contract_end_date DATE NOT NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  payment_method TEXT,
  max_students INTEGER,
  max_storage_gb NUMERIC(10, 2),
  ai_tokens_monthly INTEGER DEFAULT 0,
  customer_requirements JSONB DEFAULT '{}'::jsonb,
  sales_representative UUID,
  technical_representative UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  contract_document_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index for faster queries
CREATE INDEX idx_contracts_tenant_id ON public.contracts(tenant_id);
CREATE INDEX idx_contracts_status ON public.contracts(status);
CREATE INDEX idx_contracts_sales_rep ON public.contracts(sales_representative);
CREATE INDEX idx_contracts_created_at ON public.contracts(created_at DESC);

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Operators can view all contracts"
  ON public.contracts
  FOR SELECT
  USING (is_operator(auth.uid()));

CREATE POLICY "Operators can insert contracts"
  ON public.contracts
  FOR INSERT
  WITH CHECK (is_operator(auth.uid()));

CREATE POLICY "Operators can update contracts"
  ON public.contracts
  FOR UPDATE
  USING (is_operator(auth.uid()));

CREATE POLICY "Operators can delete contracts"
  ON public.contracts
  FOR DELETE
  USING (is_operator(auth.uid()));

-- Trigger to update updated_at
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate contract number
CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS TEXT AS $$
DECLARE
  year_month TEXT;
  sequence_num INTEGER;
  contract_num TEXT;
BEGIN
  year_month := TO_CHAR(NOW(), 'YYYYMM');
  
  SELECT COALESCE(MAX(SUBSTRING(contract_number FROM '[0-9]+$')::INTEGER), 0) + 1
  INTO sequence_num
  FROM public.contracts
  WHERE contract_number LIKE 'CNT-' || year_month || '-%';
  
  contract_num := 'CNT-' || year_month || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN contract_num;
END;
$$ LANGUAGE plpgsql;