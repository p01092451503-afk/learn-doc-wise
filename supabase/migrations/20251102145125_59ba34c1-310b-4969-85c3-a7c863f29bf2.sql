-- Add enabled_features column to tenants table
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS enabled_features TEXT[] DEFAULT '{}';

-- Add comment to the column
COMMENT ON COLUMN public.tenants.enabled_features IS 'List of enabled features for this tenant based on their plan';