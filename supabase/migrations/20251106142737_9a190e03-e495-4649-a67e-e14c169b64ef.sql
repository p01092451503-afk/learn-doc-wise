
-- Fix infinite recursion in memberships RLS policies
-- Remove circular references

-- Drop problematic policies
DROP POLICY IF EXISTS "Admins can view tenant memberships" ON memberships;
DROP POLICY IF EXISTS "Admins can create memberships" ON memberships;
DROP POLICY IF EXISTS "Admins can update memberships" ON memberships;

-- Create simpler, non-recursive policies
CREATE POLICY "Admins can view tenant memberships" ON memberships
  FOR SELECT
  USING (
    is_platform_operator(auth.uid()) 
    OR 
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
      AND ur.tenant_id = memberships.tenant_id
    )
  );

CREATE POLICY "Admins can create memberships" ON memberships
  FOR INSERT
  WITH CHECK (
    is_platform_operator(auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
      AND ur.tenant_id = memberships.tenant_id
    )
  );

CREATE POLICY "Admins can update memberships" ON memberships
  FOR UPDATE
  USING (
    is_platform_operator(auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
      AND ur.tenant_id = memberships.tenant_id
    )
  );
