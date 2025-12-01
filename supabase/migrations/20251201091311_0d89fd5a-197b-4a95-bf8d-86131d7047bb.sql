-- =============================================
-- 개인정보 보호법 준수를 위한 민감 데이터 암호화
-- pgcrypto 익스텐션 사용 (최종 수정본)
-- =============================================

-- Step 1: pgcrypto 익스텐션 활성화 (스키마 지정 제거)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 2: profiles 테이블에 phone_number 컬럼 추가
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Step 3: 암호화 함수 (TEXT를 암호화하여 BASE64 인코딩된 TEXT로 반환)
CREATE OR REPLACE FUNCTION public.encrypt_text(
  plain_text TEXT, 
  encryption_key TEXT DEFAULT 'AtomLMS-2024-Secret-Key-Change-In-Production'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF plain_text IS NULL OR plain_text = '' THEN
    RETURN NULL;
  END IF;
  
  RETURN encode(
    pgp_sym_encrypt(plain_text, encryption_key), 
    'base64'
  );
END;
$$;

-- Step 4: 복호화 함수 (BASE64 인코딩된 암호화 TEXT를 복호화하여 평문 TEXT로 반환)
CREATE OR REPLACE FUNCTION public.decrypt_text(
  encrypted_text TEXT, 
  encryption_key TEXT DEFAULT 'AtomLMS-2024-Secret-Key-Change-In-Production'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF encrypted_text IS NULL OR encrypted_text = '' THEN
    RETURN NULL;
  END IF;
  
  BEGIN
    RETURN convert_from(
      pgp_sym_decrypt(
        decode(encrypted_text, 'base64'), 
        encryption_key
      ), 
      'UTF8'
    );
  EXCEPTION 
    WHEN OTHERS THEN
      -- 복호화 실패 시 원본 반환 (기존 평문 데이터 호환성)
      RETURN encrypted_text;
  END;
END;
$$;

-- Step 5: 기존 counseling_logs 데이터 암호화
UPDATE public.counseling_logs
SET 
  student_concerns = public.encrypt_text(student_concerns),
  counselor_advice = public.encrypt_text(counselor_advice)
WHERE 
  student_concerns IS NOT NULL 
  AND student_concerns != '' 
  AND length(student_concerns) < 10000
  AND student_concerns !~ '^[A-Za-z0-9+/]+=*$';  -- BASE64가 아닌 경우만

-- Step 6: 기존 dropout_records 데이터 암호화
UPDATE public.dropout_records
SET 
  dropout_reason = public.encrypt_text(dropout_reason),
  interview_notes = public.encrypt_text(interview_notes)
WHERE 
  (dropout_reason IS NOT NULL 
    AND dropout_reason != '' 
    AND length(dropout_reason) < 10000
    AND dropout_reason !~ '^[A-Za-z0-9+/]+=*$')
  OR
  (interview_notes IS NOT NULL 
    AND interview_notes != '' 
    AND length(interview_notes) < 10000
    AND interview_notes !~ '^[A-Za-z0-9+/]+=*$');

-- Step 7: counseling_logs 삽입 RPC
CREATE OR REPLACE FUNCTION public.insert_counseling_log(
  p_course_id UUID,
  p_student_id UUID,
  p_counseling_type VARCHAR,
  p_counseling_date TIMESTAMPTZ,
  p_summary TEXT,
  p_student_concerns TEXT,
  p_counselor_advice TEXT,
  p_follow_up_needed BOOLEAN,
  p_follow_up_date DATE,
  p_is_confidential BOOLEAN
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_counselor_id UUID;
  v_log_id UUID;
BEGIN
  v_counselor_id := auth.uid();
  
  IF v_counselor_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  INSERT INTO public.counseling_logs (
    course_id,
    student_id,
    counselor_id,
    counseling_type,
    counseling_date,
    summary,
    student_concerns,
    counselor_advice,
    follow_up_needed,
    follow_up_date,
    is_confidential
  ) VALUES (
    p_course_id,
    p_student_id,
    v_counselor_id,
    p_counseling_type,
    p_counseling_date,
    p_summary,
    public.encrypt_text(p_student_concerns),
    public.encrypt_text(p_counselor_advice),
    p_follow_up_needed,
    p_follow_up_date,
    p_is_confidential
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Step 8: counseling_logs 조회 RPC
CREATE OR REPLACE FUNCTION public.get_counseling_logs(
  p_counselor_id UUID DEFAULT NULL,
  p_student_id UUID DEFAULT NULL,
  p_course_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  course_id UUID,
  student_id UUID,
  counselor_id UUID,
  counseling_type VARCHAR,
  counseling_date TIMESTAMPTZ,
  summary TEXT,
  student_concerns TEXT,
  counselor_advice TEXT,
  follow_up_needed BOOLEAN,
  follow_up_date DATE,
  is_confidential BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  RETURN QUERY
  SELECT 
    cl.id,
    cl.course_id,
    cl.student_id,
    cl.counselor_id,
    cl.counseling_type,
    cl.counseling_date,
    cl.summary,
    public.decrypt_text(cl.student_concerns) as student_concerns,
    public.decrypt_text(cl.counselor_advice) as counselor_advice,
    cl.follow_up_needed,
    cl.follow_up_date,
    cl.is_confidential,
    cl.created_at,
    cl.updated_at
  FROM public.counseling_logs cl
  WHERE 
    (p_counselor_id IS NULL OR cl.counselor_id = p_counselor_id)
    AND (p_student_id IS NULL OR cl.student_id = p_student_id)
    AND (p_course_id IS NULL OR cl.course_id = p_course_id)
    AND (
      cl.counselor_id = v_user_id 
      OR (cl.student_id = v_user_id AND cl.is_confidential = false)
      OR has_role(v_user_id, 'admin'::app_role)
    )
  ORDER BY cl.counseling_date DESC;
END;
$$;

-- Step 9: dropout_records 삽입 RPC
CREATE OR REPLACE FUNCTION public.insert_dropout_record(
  p_enrollment_id UUID,
  p_reason_category VARCHAR,
  p_dropout_reason TEXT,
  p_dropout_date TIMESTAMPTZ,
  p_interview_notes TEXT,
  p_refund_amount NUMERIC,
  p_refund_status VARCHAR,
  p_documents JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_record_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  INSERT INTO public.dropout_records (
    enrollment_id,
    reason_category,
    dropout_reason,
    dropout_date,
    interview_notes,
    refund_amount,
    refund_status,
    documents,
    processed_by,
    processed_at
  ) VALUES (
    p_enrollment_id,
    p_reason_category,
    public.encrypt_text(p_dropout_reason),
    p_dropout_date,
    public.encrypt_text(p_interview_notes),
    p_refund_amount,
    p_refund_status,
    p_documents,
    v_user_id,
    NOW()
  )
  RETURNING id INTO v_record_id;
  
  RETURN v_record_id;
END;
$$;

-- Step 10: dropout_records 조회 RPC
CREATE OR REPLACE FUNCTION public.get_dropout_records(
  p_refund_status VARCHAR DEFAULT NULL,
  p_course_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  enrollment_id UUID,
  reason_category VARCHAR,
  dropout_reason TEXT,
  dropout_date TIMESTAMPTZ,
  interview_notes TEXT,
  refund_amount NUMERIC,
  refund_status VARCHAR,
  documents JSONB,
  processed_by UUID,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  RETURN QUERY
  SELECT 
    dr.id,
    dr.enrollment_id,
    dr.reason_category,
    public.decrypt_text(dr.dropout_reason) as dropout_reason,
    dr.dropout_date,
    public.decrypt_text(dr.interview_notes) as interview_notes,
    dr.refund_amount,
    dr.refund_status,
    dr.documents,
    dr.processed_by,
    dr.processed_at,
    dr.created_at
  FROM public.dropout_records dr
  LEFT JOIN public.enrollments e ON e.id = dr.enrollment_id
  WHERE 
    (p_refund_status IS NULL OR dr.refund_status = p_refund_status)
    AND (p_course_id IS NULL OR e.course_id = p_course_id)
    AND (
      has_role(v_user_id, 'admin'::app_role)
      OR has_role(v_user_id, 'teacher'::app_role)
      OR e.user_id = v_user_id
    )
  ORDER BY dr.dropout_date DESC;
END;
$$;

-- Step 11: profiles 업데이트 RPC
CREATE OR REPLACE FUNCTION public.update_profile(
  p_full_name TEXT,
  p_phone_number TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  UPDATE public.profiles
  SET 
    full_name = p_full_name,
    phone_number = CASE 
      WHEN p_phone_number IS NOT NULL THEN public.encrypt_text(p_phone_number)
      ELSE phone_number
    END,
    updated_at = NOW()
  WHERE user_id = v_user_id;
END;
$$;

-- Step 12: profiles 조회 RPC
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.user_id,
    p.full_name,
    public.decrypt_text(p.phone_number) as phone_number,
    p.avatar_url,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.user_id = v_user_id;
END;
$$;

-- Step 13: 권한 부여
GRANT EXECUTE ON FUNCTION public.insert_counseling_log TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_counseling_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_dropout_record TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dropout_records TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_profile TO authenticated;

-- 주석
COMMENT ON EXTENSION pgcrypto IS '암호화 키는 프로덕션에서 Supabase Vault나 Secret으로 관리 필요';
COMMENT ON FUNCTION public.encrypt_text IS 'pgp_sym_encrypt로 민감 데이터 암호화 후 base64 인코딩';
COMMENT ON FUNCTION public.decrypt_text IS 'base64 디코딩 후 pgp_sym_decrypt로 복호화';
COMMENT ON FUNCTION public.insert_counseling_log IS '상담 로그 생성 시 민감 정보 자동 암호화';
COMMENT ON FUNCTION public.get_counseling_logs IS '상담 로그 조회 시 민감 정보 자동 복호화';
COMMENT ON FUNCTION public.insert_dropout_record IS '중도탈락 기록 생성 시 민감 정보 자동 암호화';
COMMENT ON FUNCTION public.get_dropout_records IS '중도탈락 기록 조회 시 민감 정보 자동 복호화';
COMMENT ON FUNCTION public.update_profile IS '프로필 업데이트 시 전화번호 자동 암호화';
COMMENT ON FUNCTION public.get_my_profile IS '프로필 조회 시 전화번호 자동 복호화';