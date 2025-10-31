-- 적응형 학습 경로 (Adaptive Learning Path) 시스템

-- 1. 학습 경로 템플릿 테이블
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  estimated_hours INTEGER NOT NULL DEFAULT 0,
  prerequisites JSONB DEFAULT '[]'::jsonb,
  learning_objectives TEXT[],
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. 학습 경로 단계 테이블
CREATE TABLE IF NOT EXISTS public.learning_path_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  learning_path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('course', 'lesson', 'assignment', 'quiz', 'project')),
  content_id UUID,
  estimated_minutes INTEGER NOT NULL DEFAULT 30,
  is_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. 사용자별 학습 경로 할당 테이블
CREATE TABLE IF NOT EXISTS public.user_learning_paths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  learning_path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  current_step_id UUID REFERENCES public.learning_path_steps(id),
  progress_percentage NUMERIC NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_completion_date DATE,
  ai_recommended BOOLEAN NOT NULL DEFAULT false,
  recommendation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, learning_path_id)
);

-- 4. 학습 경로 단계별 진행 상황 테이블
CREATE TABLE IF NOT EXISTS public.user_learning_path_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_learning_path_id UUID NOT NULL REFERENCES public.user_learning_paths(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES public.learning_path_steps(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER DEFAULT 0,
  score NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_learning_path_id, step_id)
);

-- 5. AI 학습 추천 로그 테이블
CREATE TABLE IF NOT EXISTS public.learning_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('learning_path', 'course', 'content', 'skill_gap')),
  recommended_item_id UUID,
  recommended_item_type TEXT,
  recommendation_score NUMERIC NOT NULL DEFAULT 0,
  reason TEXT,
  ai_model TEXT,
  user_data_snapshot JSONB,
  accepted BOOLEAN,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 정책 설정
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_path_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_recommendations ENABLE ROW LEVEL SECURITY;

-- learning_paths RLS
CREATE POLICY "Everyone can view active learning paths"
  ON public.learning_paths FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage learning paths"
  ON public.learning_paths FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- learning_path_steps RLS
CREATE POLICY "Users can view steps of their enrolled paths"
  ON public.learning_path_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_learning_paths
      WHERE user_learning_paths.learning_path_id = learning_path_steps.learning_path_id
        AND user_learning_paths.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.learning_paths
      WHERE learning_paths.id = learning_path_steps.learning_path_id
        AND learning_paths.is_active = true
    )
  );

CREATE POLICY "Admins can manage learning path steps"
  ON public.learning_path_steps FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- user_learning_paths RLS
CREATE POLICY "Users can view their own learning paths"
  ON public.user_learning_paths FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll in learning paths"
  ON public.user_learning_paths FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their learning path progress"
  ON public.user_learning_paths FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user learning paths"
  ON public.user_learning_paths FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage user learning paths"
  ON public.user_learning_paths FOR ALL
  USING (true);

-- user_learning_path_progress RLS
CREATE POLICY "Users can view their own progress"
  ON public.user_learning_path_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_learning_paths
      WHERE user_learning_paths.id = user_learning_path_progress.user_learning_path_id
        AND user_learning_paths.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their progress"
  ON public.user_learning_path_progress FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_learning_paths
      WHERE user_learning_paths.id = user_learning_path_progress.user_learning_path_id
        AND user_learning_paths.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all progress"
  ON public.user_learning_path_progress FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- learning_recommendations RLS
CREATE POLICY "Users can view their recommendations"
  ON public.learning_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create recommendations"
  ON public.learning_recommendations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can accept recommendations"
  ON public.learning_recommendations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all recommendations"
  ON public.learning_recommendations FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 학습 경로 진행률 계산 함수
CREATE OR REPLACE FUNCTION public.update_learning_path_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_steps INTEGER;
  v_completed_steps INTEGER;
  v_progress NUMERIC;
BEGIN
  -- 전체 단계 수와 완료된 단계 수 계산
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
  INTO v_total_steps, v_completed_steps
  FROM public.user_learning_path_progress
  WHERE user_learning_path_id = NEW.user_learning_path_id;
  
  -- 진행률 계산
  IF v_total_steps > 0 THEN
    v_progress := (v_completed_steps::NUMERIC / v_total_steps::NUMERIC) * 100;
    
    -- user_learning_paths 테이블 업데이트
    UPDATE public.user_learning_paths
    SET 
      progress_percentage = v_progress,
      completed_at = CASE WHEN v_progress >= 100 THEN now() ELSE NULL END,
      updated_at = now()
    WHERE id = NEW.user_learning_path_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_learning_path_progress_trigger
  AFTER INSERT OR UPDATE ON public.user_learning_path_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_learning_path_progress();

-- updated_at 트리거
CREATE TRIGGER update_learning_paths_updated_at
  BEFORE UPDATE ON public.learning_paths
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_learning_paths_updated_at
  BEFORE UPDATE ON public.user_learning_paths
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_learning_path_progress_updated_at
  BEFORE UPDATE ON public.user_learning_path_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 샘플 학습 경로 데이터
INSERT INTO public.learning_paths (title, description, difficulty_level, estimated_hours, learning_objectives) VALUES
('프론트엔드 개발 입문', 'HTML, CSS, JavaScript를 활용한 기초 웹 개발', 'beginner', 40, ARRAY['HTML 기본 구조 이해', 'CSS 스타일링', 'JavaScript 기초 문법', '간단한 웹페이지 제작']),
('React 마스터 과정', 'React를 활용한 모던 웹 애플리케이션 개발', 'intermediate', 60, ARRAY['React 컴포넌트 설계', 'State 관리', 'Hooks 활용', 'API 연동']),
('풀스택 개발자 로드맵', '프론트엔드부터 백엔드까지 전체 스택 학습', 'advanced', 120, ARRAY['프론트엔드 개발', '백엔드 API 설계', '데이터베이스 설계', '배포 및 운영']);