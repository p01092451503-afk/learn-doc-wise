-- Phase 2: Operator Console Integration
-- Allow tenant_id to be NULL for platform-wide operators
ALTER TABLE public.memberships
ALTER COLUMN tenant_id DROP NOT NULL;

-- Update unique constraint to allow multiple operator memberships
ALTER TABLE public.memberships
DROP CONSTRAINT IF EXISTS memberships_user_id_tenant_id_key;

-- Add new unique constraint that allows NULL tenant_id
CREATE UNIQUE INDEX memberships_user_tenant_unique 
ON public.memberships (user_id, tenant_id, role)
WHERE tenant_id IS NOT NULL;

-- Create index for operator queries
CREATE INDEX IF NOT EXISTS idx_memberships_operator 
ON public.memberships (user_id, role)
WHERE role = 'operator' AND tenant_id IS NULL;

-- Function to check if user is platform operator
CREATE OR REPLACE FUNCTION public.is_platform_operator(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.memberships
    WHERE user_id = _user_id
      AND role = 'operator'
      AND tenant_id IS NULL
      AND is_active = true
  )
$$;

-- Function to get all tenant IDs for a user (including operator access to all)
CREATE OR REPLACE FUNCTION public.get_user_accessible_tenants(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- If user is platform operator, return all tenant IDs
  SELECT CASE 
    WHEN public.is_platform_operator(_user_id) THEN
      (SELECT id FROM public.tenants WHERE is_active = true)
    ELSE
      (SELECT tenant_id FROM public.memberships 
       WHERE user_id = _user_id 
       AND is_active = true 
       AND tenant_id IS NOT NULL)
  END
$$;

-- Update RLS policies for memberships table
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.memberships;
CREATE POLICY "Users can view their own memberships"
ON public.memberships
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_platform_operator(auth.uid())
);

-- Operator can manage all memberships
DROP POLICY IF EXISTS "Operators can manage all memberships" ON public.memberships;
CREATE POLICY "Operators can manage all memberships"
ON public.memberships
FOR ALL
TO authenticated
USING (public.is_platform_operator(auth.uid()))
WITH CHECK (public.is_platform_operator(auth.uid()));

-- Update existing is_operator function to use memberships table
CREATE OR REPLACE FUNCTION public.is_operator(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT public.is_platform_operator(_user_id)
  OR EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'operator'
  )
$$;