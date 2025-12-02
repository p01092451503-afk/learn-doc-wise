-- Allow anonymous users to read verified tenant domains (needed for tenant resolution on login page)
CREATE POLICY "Allow anonymous read of verified domains"
ON public.tenant_domains
FOR SELECT
TO public
USING (is_verified = true);

-- Allow anonymous users to read active tenants (needed for tenant resolution on login page)
-- Note: There's already a similar policy, but let's ensure it works for anon users
DROP POLICY IF EXISTS "Allow public read access to active tenants" ON public.tenants;

CREATE POLICY "Allow anonymous read of active tenants"
ON public.tenants
FOR SELECT
TO anon, public
USING (is_active = true);