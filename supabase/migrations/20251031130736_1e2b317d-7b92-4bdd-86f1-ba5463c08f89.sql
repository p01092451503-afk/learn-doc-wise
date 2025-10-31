-- 고급 학습 분석 (Advanced Learning Analytics) 시스템

-- 1. 학습자 위험도 분석 테이블
CREATE TABLE IF NOT EXISTS public.learner_risk_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_score NUMERIC NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  dropout_probability NUMERIC CHECK (dropout_probability >= 0 AND dropout_probability <= 100),
  factors JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommendations TEXT[],
  last_analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  intervention_required BOOLEAN NOT NULL DEFAULT false,
  intervention_taken BOOLEAN NOT NULL DEFAULT false,
  intervention_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- 2. 학습 패턴 분석 테이블
CREATE TABLE IF NOT EXISTS public.learning_pattern_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  analysis_period TEXT NOT NULL CHECK (analysis_period IN ('daily', 'weekly', 'monthly', 'quarterly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_learning_time_minutes INTEGER NOT NULL DEFAULT 0,
  avg_session_duration_minutes NUMERIC,
  peak_learning_hour INTEGER,
  peak_learning_day INTEGER,
  consistency_score NUMERIC CHECK (consistency_score >= 0 AND consistency_score <= 100),
  engagement_score NUMERIC CHECK (engagement_score >= 0 AND engagement_score <= 100),
  preferred_content_types JSONB,
  learning_velocity NUMERIC,
  completion_rate NUMERIC,
  insights JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. 코호트 분석 테이블
CREATE TABLE IF NOT EXISTS public.cohort_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  cohort_name TEXT NOT NULL,
  cohort_definition JSONB NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_users INTEGER NOT NULL DEFAULT 0,
  active_users INTEGER NOT NULL DEFAULT 0,
  completed_users INTEGER NOT NULL DEFAULT 0,
  dropped_users INTEGER NOT NULL DEFAULT 0,
  avg_completion_time_days NUMERIC,
  avg_engagement_score NUMERIC,
  retention_rate_week1 NUMERIC,
  retention_rate_week2 NUMERIC,
  retention_rate_week4 NUMERIC,
  metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. 학습 예측 모델 테이블
CREATE TABLE IF NOT EXISTS public.learning_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  prediction_type TEXT NOT NULL CHECK (prediction_type IN ('completion_time', 'final_grade', 'dropout_risk', 'next_topic')),
  predicted_value JSONB NOT NULL,
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 100),
  model_version TEXT,
  prediction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  actual_value JSONB,
  prediction_accuracy NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. 개인화 추천 이력 테이블 (확장)
CREATE TABLE IF NOT EXISTS public.personalized_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('content', 'pace', 'study_time', 'peer_group', 'mentor')),
  recommendation_data JSONB NOT NULL,
  reasoning TEXT,
  priority_score NUMERIC NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'accepted', 'dismissed')),
  viewed_at TIMESTAMP WITH TIME ZONE,
  acted_at TIMESTAMP WITH TIME ZONE,
  effectiveness_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 정책 설정
ALTER TABLE public.learner_risk_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_pattern_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_recommendations ENABLE ROW LEVEL SECURITY;

-- learner_risk_analysis RLS
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

-- learning_pattern_analysis RLS
CREATE POLICY "Users can view their own patterns"
  ON public.learning_pattern_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all patterns"
  ON public.learning_pattern_analysis FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage patterns"
  ON public.learning_pattern_analysis FOR ALL
  USING (true);

-- cohort_analysis RLS
CREATE POLICY "Admins can view cohort analysis"
  ON public.cohort_analysis FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Teachers can view cohort analysis for their courses"
  ON public.cohort_analysis FOR SELECT
  USING (
    has_role(auth.uid(), 'teacher'::app_role) AND
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = cohort_analysis.course_id
        AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "System can manage cohort analysis"
  ON public.cohort_analysis FOR ALL
  USING (true);

-- learning_predictions RLS
CREATE POLICY "Users can view their own predictions"
  ON public.learning_predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all predictions"
  ON public.learning_predictions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage predictions"
  ON public.learning_predictions FOR ALL
  USING (true);

-- personalized_recommendations RLS
CREATE POLICY "Users can view their recommendations"
  ON public.personalized_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update recommendation status"
  ON public.personalized_recommendations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all recommendations"
  ON public.personalized_recommendations FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can create recommendations"
  ON public.personalized_recommendations FOR INSERT
  WITH CHECK (true);

-- 위험도 자동 계산 함수
CREATE OR REPLACE FUNCTION public.calculate_learner_risk(
  p_user_id UUID,
  p_course_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_enrollment_data RECORD;
  v_activity_data RECORD;
  v_risk_score NUMERIC := 0;
  v_risk_level TEXT;
  v_factors JSONB := '{}'::jsonb;
  v_dropout_prob NUMERIC := 0;
BEGIN
  -- 수강 데이터 가져오기
  SELECT 
    e.progress,
    e.enrolled_at,
    EXTRACT(DAYS FROM now() - e.enrolled_at) as days_enrolled
  INTO v_enrollment_data
  FROM public.enrollments e
  WHERE e.user_id = p_user_id AND e.course_id = p_course_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Enrollment not found');
  END IF;
  
  -- 활동 데이터 가져오기
  SELECT 
    COUNT(*) FILTER (WHERE cp.completed = true) as completed_lessons,
    COUNT(*) as total_accessed,
    MAX(cp.last_accessed_at) as last_activity,
    EXTRACT(DAYS FROM now() - MAX(cp.last_accessed_at)) as days_since_activity
  INTO v_activity_data
  FROM public.content_progress cp
  JOIN public.course_contents cc ON cc.id = cp.content_id
  WHERE cp.user_id = p_user_id AND cc.course_id = p_course_id;
  
  -- 위험 점수 계산 (0-100, 높을수록 위험)
  -- 1. 진행률 낮음 (30점)
  IF v_enrollment_data.progress < 10 AND v_enrollment_data.days_enrolled > 7 THEN
    v_risk_score := v_risk_score + 30;
    v_factors := jsonb_set(v_factors, '{low_progress}', 'true'::jsonb);
  ELSIF v_enrollment_data.progress < 30 AND v_enrollment_data.days_enrolled > 14 THEN
    v_risk_score := v_risk_score + 20;
    v_factors := jsonb_set(v_factors, '{slow_progress}', 'true'::jsonb);
  END IF;
  
  -- 2. 최근 활동 없음 (40점)
  IF v_activity_data.days_since_activity > 14 THEN
    v_risk_score := v_risk_score + 40;
    v_factors := jsonb_set(v_factors, '{inactive}', 'true'::jsonb);
  ELSIF v_activity_data.days_since_activity > 7 THEN
    v_risk_score := v_risk_score + 20;
    v_factors := jsonb_set(v_factors, '{low_activity}', 'true'::jsonb);
  END IF;
  
  -- 3. 수강 기간 대비 진행률 (30점)
  IF v_enrollment_data.days_enrolled > 30 AND v_enrollment_data.progress < 25 THEN
    v_risk_score := v_risk_score + 30;
    v_factors := jsonb_set(v_factors, '{slow_pace}', 'true'::jsonb);
  END IF;
  
  -- 위험 레벨 결정
  IF v_risk_score >= 70 THEN
    v_risk_level := 'critical';
    v_dropout_prob := 85;
  ELSIF v_risk_score >= 50 THEN
    v_risk_level := 'high';
    v_dropout_prob := 65;
  ELSIF v_risk_score >= 30 THEN
    v_risk_level := 'medium';
    v_dropout_prob := 40;
  ELSE
    v_risk_level := 'low';
    v_dropout_prob := 15;
  END IF;
  
  RETURN jsonb_build_object(
    'risk_score', v_risk_score,
    'risk_level', v_risk_level,
    'dropout_probability', v_dropout_prob,
    'factors', v_factors
  );
END;
$$;

-- updated_at 트리거
CREATE TRIGGER update_learner_risk_analysis_updated_at
  BEFORE UPDATE ON public.learner_risk_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();