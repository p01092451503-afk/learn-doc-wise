
-- 테넌트 상태 타입 추가
CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'terminated', 'trial');

-- 테넌트 테이블에 새 컬럼 추가
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS custom_domain TEXT,
ADD COLUMN IF NOT EXISTS max_bandwidth_gb INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS features_enabled JSONB DEFAULT '{"ai": true, "analytics": true, "community": true, "gamification": true, "certificates": true}'::jsonb,
ADD COLUMN IF NOT EXISTS status tenant_status DEFAULT 'active',
ADD COLUMN IF NOT EXISTS suspended_reason TEXT,
ADD COLUMN IF NOT EXISTS contract_end_date DATE,
ADD COLUMN IF NOT EXISTS trial_end_date DATE;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_custom_domain ON public.tenants(custom_domain);

-- 테넌트 접속 차단 로그 테이블 생성
CREATE TABLE IF NOT EXISTS public.tenant_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'allowed', 'blocked', 'suspended'
  reason TEXT,
  user_ip INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 테넌트 설정 변경 이력 테이블
CREATE TABLE IF NOT EXISTS public.tenant_config_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES auth.users(id),
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS 정책
ALTER TABLE public.tenant_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_config_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operators can view access logs"
ON public.tenant_access_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'operator'
  )
);

CREATE POLICY "System can insert access logs"
ON public.tenant_access_logs FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Operators can view config history"
ON public.tenant_config_history FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'operator'
  )
);

CREATE POLICY "Operators can insert config history"
ON public.tenant_config_history FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'operator'
  )
);

-- 테넌트 접속 차단 확인 함수
CREATE OR REPLACE FUNCTION public.check_tenant_access(p_tenant_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tenant RECORD;
  v_result JSONB;
BEGIN
  SELECT 
    status,
    is_active,
    suspended_reason,
    contract_end_date,
    trial_end_date
  INTO v_tenant
  FROM public.tenants
  WHERE id = p_tenant_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Tenant not found'
    );
  END IF;
  
  -- 계약 종료 확인
  IF v_tenant.contract_end_date IS NOT NULL AND v_tenant.contract_end_date < CURRENT_DATE THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Contract expired',
      'details', 'Contract ended on ' || v_tenant.contract_end_date
    );
  END IF;
  
  -- 트라이얼 종료 확인
  IF v_tenant.status = 'trial' AND v_tenant.trial_end_date IS NOT NULL AND v_tenant.trial_end_date < CURRENT_DATE THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Trial period expired',
      'details', 'Trial ended on ' || v_tenant.trial_end_date
    );
  END IF;
  
  -- 상태 확인
  IF v_tenant.status = 'terminated' THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Tenant terminated',
      'details', v_tenant.suspended_reason
    );
  END IF;
  
  IF v_tenant.status = 'suspended' THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Tenant suspended',
      'details', v_tenant.suspended_reason
    );
  END IF;
  
  IF NOT v_tenant.is_active THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Tenant inactive'
    );
  END IF;
  
  -- 모든 체크 통과
  RETURN jsonb_build_object(
    'allowed', true,
    'status', v_tenant.status
  );
END;
$$;
