
-- 테넌트 접속 차단 확인 함수 (search_path 추가)
CREATE OR REPLACE FUNCTION public.check_tenant_access(p_tenant_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
