-- 고급 학습 분석 시스템 - 정책 재생성

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view their own risk analysis" ON public.learner_risk_analysis;
DROP POLICY IF EXISTS "Teachers can view risk analysis for their courses" ON public.learner_risk_analysis;
DROP POLICY IF EXISTS "Admins can manage all risk analysis" ON public.learner_risk_analysis;
DROP POLICY IF EXISTS "System can manage risk analysis" ON public.learner_risk_analysis;

-- learner_risk_analysis RLS 재생성
CREATE POLICY "Users can view their own risk analysis"
  ON public.learner_risk_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view risk analysis for their courses"
  ON public.learner_risk_analysis FOR SELECT
  USING (
    has_role(auth.uid(), 'teacher'::app_role) AND
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = learner_risk_analysis.course_id
        AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all risk analysis"
  ON public.learner_risk_analysis FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage risk analysis"
  ON public.learner_risk_analysis FOR ALL
  USING (true);