-- =====================================================
-- RLS Policies for Multi-tenant Tables
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;

-- Security definer functions for role checking
CREATE OR REPLACE FUNCTION public.has_membership_role(_user_id UUID, _tenant_id UUID, _role membership_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.memberships
    WHERE user_id = _user_id
      AND tenant_id = _tenant_id
      AND role = _role
      AND is_active = true
  )
$$;

CREATE OR REPLACE FUNCTION public.is_operator(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.memberships
    WHERE user_id = _user_id
      AND role = 'operator'
      AND is_active = true
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_tenant_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id
  FROM public.memberships
  WHERE user_id = _user_id
    AND is_active = true
$$;

-- PLANS policies (platform-wide, read-only for tenants)
CREATE POLICY "Everyone can view active plans"
  ON public.plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "Operators can manage plans"
  ON public.plans FOR ALL
  USING (public.is_operator(auth.uid()));

-- FEATURES policies (platform-wide catalog)
CREATE POLICY "Everyone can view features"
  ON public.features FOR SELECT
  USING (true);

CREATE POLICY "Operators can manage features"
  ON public.features FOR ALL
  USING (public.is_operator(auth.uid()));

-- TENANT_DOMAINS policies
CREATE POLICY "Tenant admins can view their domains"
  ON public.tenant_domains FOR SELECT
  USING (
    tenant_id IN (
      SELECT public.get_user_tenant_ids(auth.uid())
    )
    OR public.is_operator(auth.uid())
  );

CREATE POLICY "Tenant admins can manage their domains"
  ON public.tenant_domains FOR ALL
  USING (
    public.has_membership_role(auth.uid(), tenant_id, 'admin')
    OR public.is_operator(auth.uid())
  );

-- TENANT_FEATURES policies
CREATE POLICY "Tenant members can view their features"
  ON public.tenant_features FOR SELECT
  USING (
    tenant_id IN (
      SELECT public.get_user_tenant_ids(auth.uid())
    )
    OR public.is_operator(auth.uid())
  );

CREATE POLICY "Tenant admins can manage features"
  ON public.tenant_features FOR ALL
  USING (
    public.has_membership_role(auth.uid(), tenant_id, 'admin')
    OR public.is_operator(auth.uid())
  );

-- MEMBERSHIPS policies
CREATE POLICY "Users can view memberships in their tenants"
  ON public.memberships FOR SELECT
  USING (
    user_id = auth.uid()
    OR tenant_id IN (
      SELECT public.get_user_tenant_ids(auth.uid())
    )
    OR public.is_operator(auth.uid())
  );

CREATE POLICY "Tenant admins can manage memberships"
  ON public.memberships FOR INSERT
  WITH CHECK (
    public.has_membership_role(auth.uid(), tenant_id, 'admin')
    OR public.is_operator(auth.uid())
  );

CREATE POLICY "Tenant admins can update memberships"
  ON public.memberships FOR UPDATE
  USING (
    public.has_membership_role(auth.uid(), tenant_id, 'admin')
    OR public.is_operator(auth.uid())
  );

CREATE POLICY "Tenant admins can delete memberships"
  ON public.memberships FOR DELETE
  USING (
    public.has_membership_role(auth.uid(), tenant_id, 'admin')
    OR public.is_operator(auth.uid())
  );

-- AUDIT_LOGS_V2 policies (read-only, system managed)
CREATE POLICY "Tenant admins can view their audit logs"
  ON public.audit_logs_v2 FOR SELECT
  USING (
    (tenant_id IS NOT NULL AND public.has_membership_role(auth.uid(), tenant_id, 'admin'))
    OR public.is_operator(auth.uid())
  );

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs_v2 FOR INSERT
  WITH CHECK (true);

-- USAGE_COUNTERS policies
CREATE POLICY "Tenant admins can view their usage"
  ON public.usage_counters FOR SELECT
  USING (
    public.has_membership_role(auth.uid(), tenant_id, 'admin')
    OR public.is_operator(auth.uid())
  );

CREATE POLICY "System can manage usage counters"
  ON public.usage_counters FOR ALL
  USING (public.is_operator(auth.uid()));

-- Update existing tables RLS for tenant isolation
-- Note: These policies assume tenant_id is now populated

-- COURSES: Only accessible within tenant scope
DROP POLICY IF EXISTS "Admins can manage all courses" ON public.courses;
DROP POLICY IF EXISTS "Everyone can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Teachers can manage their course assignments" ON public.courses;

CREATE POLICY "Tenant members can view published courses"
  ON public.courses FOR SELECT
  USING (
    (status = 'published' AND tenant_id IN (SELECT public.get_user_tenant_ids(auth.uid())))
    OR public.has_membership_role(auth.uid(), tenant_id, 'admin')
    OR public.has_membership_role(auth.uid(), tenant_id, 'instructor')
    OR public.is_operator(auth.uid())
  );

CREATE POLICY "Instructors can manage their courses"
  ON public.courses FOR ALL
  USING (
    (instructor_id = auth.uid() AND tenant_id IN (SELECT public.get_user_tenant_ids(auth.uid())))
    OR public.has_membership_role(auth.uid(), tenant_id, 'admin')
    OR public.is_operator(auth.uid())
  );

-- ENROLLMENTS: Tenant-scoped
DROP POLICY IF EXISTS "Students can enroll in courses" ON public.enrollments;

CREATE POLICY "Tenant students can enroll"
  ON public.enrollments FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND tenant_id IN (SELECT public.get_user_tenant_ids(auth.uid()))
  );

CREATE POLICY "Users can view their tenant enrollments"
  ON public.enrollments FOR SELECT
  USING (
    (user_id = auth.uid() AND tenant_id IN (SELECT public.get_user_tenant_ids(auth.uid())))
    OR public.has_membership_role(auth.uid(), tenant_id, 'admin')
    OR public.has_membership_role(auth.uid(), tenant_id, 'instructor')
    OR public.is_operator(auth.uid())
  );