-- 관리자는 결제 없이 모든 강좌 콘텐츠를 볼 수 있도록 RLS 정책 추가
CREATE POLICY "Admins can view all course contents"
  ON public.course_contents
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 관리자는 자동으로 모든 강좌에 등록된 것으로 간주
-- content_progress 테이블에 관리자가 삽입/업데이트 가능하도록 정책 추가
CREATE POLICY "Admins can manage all content progress"
  ON public.content_progress
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 관리자가 모든 강좌의 수강 정보를 볼 수 있도록 enrollments 정책 수정 (이미 있으므로 확인만)
-- 이미 "Admins can view all enrollments" 정책이 있음

-- 관리자용 가상 등록 확인 함수 생성
-- 관리자는 항상 모든 강좌에 등록된 것으로 간주
CREATE OR REPLACE FUNCTION public.is_enrolled_or_admin(p_user_id uuid, p_course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    has_role(p_user_id, 'admin'::app_role) 
    OR 
    EXISTS (
      SELECT 1 
      FROM public.enrollments 
      WHERE user_id = p_user_id 
        AND course_id = p_course_id
    )
$$;