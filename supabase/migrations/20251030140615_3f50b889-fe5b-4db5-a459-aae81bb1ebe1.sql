-- Step 2: user_roles 테이블에 tenant_id 컬럼 추가 및 관련 설정

-- 2-1. user_roles 테이블에 tenant_id 컬럼 추가 (nullable, 운영자는 null)
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- 2-2. tenant_id 컬럼에 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_user_roles_tenant_id ON public.user_roles(tenant_id);

-- 2-3. user_roles 테이블의 unique constraint 업데이트
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_role_tenant_unique 
UNIQUE (user_id, role, tenant_id);

-- 2-4. tenant별 역할 확인 함수 추가
CREATE OR REPLACE FUNCTION public.has_role_in_tenant(_user_id uuid, _role app_role, _tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (tenant_id = _tenant_id OR tenant_id IS NULL)
  )
$$;

-- 2-5. 사용자의 tenant_id 가져오기 함수
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id
  FROM public.user_roles
  WHERE user_id = _user_id
    AND role = 'admin'
  LIMIT 1
$$;

-- 2-6. 운영자 확인 함수
CREATE OR REPLACE FUNCTION public.is_operator(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND (role = 'operator' OR (role = 'admin' AND tenant_id IS NULL))
  )
$$;

-- 2-7. RLS 정책 업데이트: tenants 테이블
DROP POLICY IF EXISTS "Admins can view all tenants" ON public.tenants;
CREATE POLICY "Operators and admins can view tenants"
ON public.tenants
FOR SELECT
USING (
  is_operator(auth.uid()) 
  OR 
  id = get_user_tenant_id(auth.uid())
);

DROP POLICY IF EXISTS "Admins can insert tenants" ON public.tenants;
CREATE POLICY "Operators can insert tenants"
ON public.tenants
FOR INSERT
WITH CHECK (is_operator(auth.uid()));

DROP POLICY IF EXISTS "Admins can update tenants" ON public.tenants;
CREATE POLICY "Operators can update tenants"
ON public.tenants
FOR UPDATE
USING (is_operator(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete tenants" ON public.tenants;
CREATE POLICY "Operators can delete tenants"
ON public.tenants
FOR DELETE
USING (is_operator(auth.uid()));

-- 2-8. RLS 정책 업데이트: usage_metrics 테이블
DROP POLICY IF EXISTS "Admins can view all usage metrics" ON public.usage_metrics;
CREATE POLICY "Operators and admins can view usage metrics"
ON public.usage_metrics
FOR SELECT
USING (
  is_operator(auth.uid())
  OR
  tenant_id = get_user_tenant_id(auth.uid())
);

-- 2-9. RLS 정책 업데이트: payment_transactions 테이블
DROP POLICY IF EXISTS "Admin can view all payment transactions" ON public.payment_transactions;
CREATE POLICY "Operators and admins can view payment transactions"
ON public.payment_transactions
FOR SELECT
USING (
  is_operator(auth.uid())
  OR
  tenant_id = get_user_tenant_id(auth.uid())
);

-- 2-10. COMMENT 추가 (문서화)
COMMENT ON COLUMN public.user_roles.tenant_id IS 'Tenant ID for admin role. NULL for operators and platform-level roles';
COMMENT ON FUNCTION public.is_operator(uuid) IS 'Check if user is a platform operator (operator role or admin with null tenant_id)';
COMMENT ON FUNCTION public.get_user_tenant_id(uuid) IS 'Get tenant_id for admin user. Returns NULL for operators';
COMMENT ON FUNCTION public.has_role_in_tenant(uuid, app_role, uuid) IS 'Check if user has specific role in specific tenant';