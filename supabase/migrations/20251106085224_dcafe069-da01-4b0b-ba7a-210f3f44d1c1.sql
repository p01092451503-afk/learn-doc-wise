-- =====================================================
-- Multi-tenant Enhancement Migration
-- =====================================================

-- Create membership_role enum if not exists
DO $$ BEGIN
  CREATE TYPE public.membership_role AS ENUM ('student', 'instructor', 'admin', 'operator');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create plan_tier enum if not exists
DO $$ BEGIN
  CREATE TYPE public.plan_tier AS ENUM ('free', 'basic', 'pro', 'enterprise');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add missing columns to tenants table
ALTER TABLE public.tenants 
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS plan_id UUID,
  ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{
    "logo_url": null,
    "primary_color": "#6366f1", 
    "secondary_color": "#8b5cf6",
    "favicon_url": null,
    "email_signature": null
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
    "language": "ko",
    "timezone": "Asia/Seoul", 
    "allow_public_courses": false,
    "require_email_verification": true
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS contract_start_date DATE;

-- Update slug from subdomain if null
UPDATE public.tenants SET slug = subdomain WHERE slug IS NULL;

-- Make slug NOT NULL and UNIQUE
ALTER TABLE public.tenants 
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_slug_unique ON public.tenants(slug);

-- Plans table
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier plan_tier NOT NULL DEFAULT 'free',
  price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0,
  limits JSONB NOT NULL DEFAULT '{
    "max_users": 10,
    "max_courses": 3,
    "max_storage_gb": 1,
    "max_monthly_emails": 100,
    "max_monthly_api_calls": 1000
  }'::jsonb,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Features catalog
CREATE TABLE IF NOT EXISTS public.features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tenant domains
CREATE TABLE IF NOT EXISTS public.tenant_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  ssl_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tenant features junction
CREATE TABLE IF NOT EXISTS public.tenant_features (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES public.features(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, feature_id)
);

-- Memberships table (tenant-scoped roles)
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role membership_role NOT NULL DEFAULT 'student',
  is_active BOOLEAN DEFAULT true,
  invited_by UUID,
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id, role)
);

-- Audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  actor_user_id UUID NOT NULL,
  impersonated_by UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Usage counters
CREATE TABLE IF NOT EXISTS public.usage_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  metric TEXT NOT NULL,
  value BIGINT NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, metric, period_start)
);

-- Add tenant_id to existing tables if not exists
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.assignment_submissions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.course_contents ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.content_progress ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants(status) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_tenant_domains_domain ON public.tenant_domains(domain);
CREATE INDEX IF NOT EXISTS idx_memberships_tenant_user ON public.memberships(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON public.memberships(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_audit_logs_v2_tenant ON public.audit_logs_v2(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_v2_actor ON public.audit_logs_v2(actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_counters_tenant ON public.usage_counters(tenant_id, metric, period_start);
CREATE INDEX IF NOT EXISTS idx_courses_tenant ON public.courses(tenant_id) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_enrollments_tenant ON public.enrollments(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_tenant ON public.assignments(tenant_id, course_id);
CREATE INDEX IF NOT EXISTS idx_submissions_tenant ON public.assignment_submissions(tenant_id, student_id);