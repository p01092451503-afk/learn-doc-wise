-- Drop all existing policies on memberships
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.memberships;
DROP POLICY IF EXISTS "Tenant admins can view tenant memberships" ON public.memberships;
DROP POLICY IF EXISTS "Tenant admins can create memberships" ON public.memberships;
DROP POLICY IF EXISTS "Tenant admins can update memberships" ON public.memberships;
DROP POLICY IF EXISTS "Platform operators can manage all memberships" ON public.memberships;
DROP POLICY IF EXISTS "Tenant admins can view their memberships" ON public.memberships;
DROP POLICY IF EXISTS "Tenant admins can manage memberships" ON public.memberships;

-- Create comprehensive policies

-- Policy 1: Users can always view their own memberships
CREATE POLICY "Users can view own memberships"
ON public.memberships
FOR SELECT
USING (user_id = auth.uid());

-- Policy 2: Tenant admins can view all memberships in their tenant
CREATE POLICY "Admins can view tenant memberships"
ON public.memberships
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

-- Policy 3: Tenant admins can create memberships
CREATE POLICY "Admins can create memberships"
ON public.memberships
FOR INSERT
WITH CHECK (
  tenant_id IN (
    SELECT tenant_id FROM public.memberships
    WHERE user_id = auth.uid()
    AND role = 'admin'
    AND is_active = true
  )
  OR is_platform_operator(auth.uid())
);

-- Policy 4: Tenant admins can update memberships
CREATE POLICY "Admins can update memberships"
ON public.memberships
FOR UPDATE
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.memberships
    WHERE user_id = auth.uid()
    AND role = 'admin'
    AND is_active = true
  )
  OR is_platform_operator(auth.uid())
);

-- Policy 5: Platform operators can do everything
CREATE POLICY "Operators manage all"
ON public.memberships
FOR ALL
USING (is_platform_operator(auth.uid()))
WITH CHECK (is_platform_operator(auth.uid()));