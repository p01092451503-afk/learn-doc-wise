-- Enable realtime for usage_metrics table
ALTER PUBLICATION supabase_realtime ADD TABLE public.usage_metrics;

-- Create function to check if action is blocked by usage limits
CREATE OR REPLACE FUNCTION public.check_usage_limit_block(
  p_tenant_id UUID,
  p_limit_type TEXT -- 'student', 'storage', 'ai_token'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tenant_plan TEXT;
  v_max_students INTEGER;
  v_max_storage_gb NUMERIC;
  v_current_students INTEGER;
  v_current_storage_gb NUMERIC;
  v_current_ai_tokens INTEGER;
  v_max_ai_tokens INTEGER;
BEGIN
  -- Get tenant info
  SELECT plan, max_students, max_storage_gb
  INTO v_tenant_plan, v_max_students, v_max_storage_gb
  FROM public.tenants
  WHERE id = p_tenant_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Get latest usage metrics
  SELECT 
    student_count,
    storage_used_gb,
    ai_tokens_used
  INTO 
    v_current_students,
    v_current_storage_gb,
    v_current_ai_tokens
  FROM public.usage_metrics
  WHERE tenant_id = p_tenant_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- Set AI token limits based on plan
  v_max_ai_tokens := CASE v_tenant_plan
    WHEN 'starter' THEN 100000
    WHEN 'professional' THEN 500000
    WHEN 'enterprise' THEN 2000000
    ELSE 100000
  END;

  -- Check limits based on type
  IF p_limit_type = 'student' THEN
    RETURN COALESCE(v_current_students, 0) >= v_max_students;
  ELSIF p_limit_type = 'storage' THEN
    RETURN COALESCE(v_current_storage_gb, 0) >= v_max_storage_gb;
  ELSIF p_limit_type = 'ai_token' THEN
    RETURN COALESCE(v_current_ai_tokens, 0) >= v_max_ai_tokens;
  END IF;

  RETURN FALSE;
END;
$$;

-- Create trigger function to prevent actions when limits exceeded
CREATE OR REPLACE FUNCTION public.prevent_enrollment_if_student_limit_exceeded()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF check_usage_limit_block(NEW.tenant_id, 'student') THEN
    RAISE EXCEPTION '학생 수 제한에 도달했습니다. 플랜을 업그레이드하세요.';
  END IF;
  RETURN NEW;
END;
$$;

-- Add trigger to enrollments table
DROP TRIGGER IF EXISTS check_student_limit_before_enrollment ON public.enrollments;
CREATE TRIGGER check_student_limit_before_enrollment
  BEFORE INSERT ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_enrollment_if_student_limit_exceeded();