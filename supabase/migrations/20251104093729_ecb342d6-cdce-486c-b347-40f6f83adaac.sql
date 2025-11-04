-- Allow public read access to tenants table for active tenants
-- This is needed for the public tenant home pages to work
CREATE POLICY "Allow public read access to active tenants"
ON public.tenants
FOR SELECT
TO public
USING (is_active = true AND status = 'active');

-- Also allow public read access to tenant_settings for active tenants
CREATE POLICY "Allow public read access to tenant settings"
ON public.tenant_settings
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.tenants
    WHERE tenants.id = tenant_settings.tenant_id
    AND tenants.is_active = true
    AND tenants.status = 'active'
  )
);