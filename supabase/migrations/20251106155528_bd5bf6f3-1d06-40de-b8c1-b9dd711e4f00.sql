-- Allow operators to create tenants and memberships for testing
-- This is needed for the test data creation feature

-- Update tenants RLS policies to allow operators to insert
DROP POLICY IF EXISTS "Operators can create tenants" ON public.tenants;
CREATE POLICY "Operators can create tenants"
  ON public.tenants
  FOR INSERT
  TO authenticated
  WITH CHECK (is_operator(auth.uid()));

-- Update memberships RLS policies to allow users to create their own memberships for testing
DROP POLICY IF EXISTS "Users can create memberships for testing" ON public.memberships;
CREATE POLICY "Users can create memberships for testing"
  ON public.memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR 
    is_operator(auth.uid())
  );

-- Update usage_metrics to allow system to insert
DROP POLICY IF EXISTS "System can insert usage metrics" ON public.usage_metrics;
CREATE POLICY "System can insert usage metrics"
  ON public.usage_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Update billing_history to allow system to insert (keep existing policies)
-- The existing policy "System can insert billing records" should work

-- Allow operators to view all tenants
DROP POLICY IF EXISTS "Operators can view all tenants" ON public.tenants;
CREATE POLICY "Operators can view all tenants"
  ON public.tenants
  FOR SELECT
  TO authenticated
  USING (is_operator(auth.uid()));

-- Allow tenant admins to view their tenant
DROP POLICY IF EXISTS "Tenant admins can view their tenant" ON public.tenants;
CREATE POLICY "Tenant admins can view their tenant"
  ON public.tenants
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT tenant_id 
      FROM public.memberships 
      WHERE user_id = auth.uid() 
        AND role = 'admin' 
        AND is_active = true
    )
  );