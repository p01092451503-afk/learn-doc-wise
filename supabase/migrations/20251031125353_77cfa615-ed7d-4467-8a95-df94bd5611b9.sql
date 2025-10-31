-- 게이미피케이션 시스템 테이블 생성

-- 1. 사용자 포인트 및 레벨 테이블
CREATE TABLE IF NOT EXISTS public.user_gamification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  experience_points INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tenant_id)
);

-- 2. 배지 정의 테이블
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('bronze', 'silver', 'gold', 'platinum')),
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('points', 'courses_completed', 'streak', 'lessons_completed', 'assignments_completed')),
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. 사용자 획득 배지 테이블
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- 4. 포인트 이력 테이블
CREATE TABLE IF NOT EXISTS public.point_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('lesson_completed', 'assignment_completed', 'course_completed', 'streak_bonus', 'community_post', 'community_comment', 'login')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. 리더보드 뷰 (상위 100명)
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  ug.user_id,
  p.full_name,
  p.avatar_url,
  ug.total_points,
  ug.level,
  ug.tenant_id,
  ROW_NUMBER() OVER (PARTITION BY ug.tenant_id ORDER BY ug.total_points DESC) as rank
FROM public.user_gamification ug
JOIN public.profiles p ON ug.user_id = p.user_id
ORDER BY ug.tenant_id, ug.total_points DESC;

-- RLS 정책 설정
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_history ENABLE ROW LEVEL SECURITY;

-- user_gamification RLS
CREATE POLICY "Users can view their own gamification data"
  ON public.user_gamification FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view gamification in their tenant"
  ON public.user_gamification FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert gamification data"
  ON public.user_gamification FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update gamification data"
  ON public.user_gamification FOR UPDATE
  USING (true);

-- badges RLS
CREATE POLICY "Everyone can view badges"
  ON public.badges FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage badges"
  ON public.badges FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- user_badges RLS
CREATE POLICY "Users can view their own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view badges in their tenant"
  ON public.user_badges FOR SELECT
  USING (
    user_id IN (
      SELECT ur1.user_id FROM public.user_roles ur1
      WHERE ur1.tenant_id IN (
        SELECT ur2.tenant_id FROM public.user_roles ur2 WHERE ur2.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "System can award badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (true);

-- point_history RLS
CREATE POLICY "Users can view their own point history"
  ON public.point_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all point history in tenant"
  ON public.point_history FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'teacher'::app_role)
  );

CREATE POLICY "System can add point history"
  ON public.point_history FOR INSERT
  WITH CHECK (true);

-- 포인트 적립 함수
CREATE OR REPLACE FUNCTION public.award_points(
  p_user_id UUID,
  p_tenant_id UUID,
  p_points INTEGER,
  p_action_type TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_total INTEGER;
  v_new_level INTEGER;
  v_experience INTEGER;
BEGIN
  -- 포인트 이력 추가
  INSERT INTO public.point_history (user_id, tenant_id, points, action_type, description)
  VALUES (p_user_id, p_tenant_id, p_points, p_action_type, p_description);
  
  -- 사용자 게이미피케이션 데이터 업데이트 또는 생성
  INSERT INTO public.user_gamification (user_id, tenant_id, total_points, experience_points)
  VALUES (p_user_id, p_tenant_id, p_points, p_points)
  ON CONFLICT (user_id, tenant_id)
  DO UPDATE SET
    total_points = user_gamification.total_points + p_points,
    experience_points = user_gamification.experience_points + p_points,
    updated_at = now();
  
  -- 레벨 계산 (100 경험치당 1레벨)
  SELECT experience_points INTO v_experience
  FROM public.user_gamification
  WHERE user_id = p_user_id AND tenant_id = p_tenant_id;
  
  v_new_level := GREATEST(1, FLOOR(v_experience / 100) + 1);
  
  UPDATE public.user_gamification
  SET level = v_new_level
  WHERE user_id = p_user_id AND tenant_id = p_tenant_id;
  
  -- 배지 자동 획득 체크
  PERFORM public.check_and_award_badges(p_user_id, p_tenant_id);
END;
$$;

-- 배지 자동 획득 체크 함수
CREATE OR REPLACE FUNCTION public.check_and_award_badges(
  p_user_id UUID,
  p_tenant_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  badge_record RECORD;
  user_value INTEGER;
BEGIN
  FOR badge_record IN 
    SELECT * FROM public.badges 
    WHERE (tenant_id = p_tenant_id OR tenant_id IS NULL)
    AND id NOT IN (SELECT badge_id FROM public.user_badges WHERE user_id = p_user_id)
  LOOP
    user_value := 0;
    
    -- 요구사항 타입에 따라 사용자 값 가져오기
    CASE badge_record.requirement_type
      WHEN 'points' THEN
        SELECT total_points INTO user_value
        FROM public.user_gamification
        WHERE user_id = p_user_id AND tenant_id = p_tenant_id;
      WHEN 'streak' THEN
        SELECT streak_days INTO user_value
        FROM public.user_gamification
        WHERE user_id = p_user_id AND tenant_id = p_tenant_id;
      WHEN 'courses_completed' THEN
        SELECT COUNT(*) INTO user_value
        FROM public.enrollments
        WHERE user_id = p_user_id AND completed_at IS NOT NULL;
      WHEN 'lessons_completed' THEN
        SELECT COUNT(*) INTO user_value
        FROM public.content_progress
        WHERE user_id = p_user_id AND completed = true;
      WHEN 'assignments_completed' THEN
        SELECT COUNT(*) INTO user_value
        FROM public.assignment_submissions
        WHERE user_id = p_user_id AND status = 'graded';
    END CASE;
    
    -- 요구사항 충족 시 배지 획득
    IF user_value >= badge_record.requirement_value THEN
      INSERT INTO public.user_badges (user_id, badge_id)
      VALUES (p_user_id, badge_record.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$$;

-- 스트릭 업데이트 함수
CREATE OR REPLACE FUNCTION public.update_streak(
  p_user_id UUID,
  p_tenant_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_date DATE;
  v_current_streak INTEGER;
BEGIN
  SELECT last_activity_date, streak_days INTO v_last_date, v_current_streak
  FROM public.user_gamification
  WHERE user_id = p_user_id AND tenant_id = p_tenant_id;
  
  IF v_last_date IS NULL THEN
    -- 첫 활동
    UPDATE public.user_gamification
    SET streak_days = 1, last_activity_date = CURRENT_DATE
    WHERE user_id = p_user_id AND tenant_id = p_tenant_id;
  ELSIF v_last_date = CURRENT_DATE THEN
    -- 오늘 이미 활동함
    RETURN;
  ELSIF v_last_date = CURRENT_DATE - INTERVAL '1 day' THEN
    -- 연속 활동
    UPDATE public.user_gamification
    SET streak_days = streak_days + 1, last_activity_date = CURRENT_DATE
    WHERE user_id = p_user_id AND tenant_id = p_tenant_id;
    
    -- 스트릭 보너스 포인트
    IF v_current_streak + 1 >= 7 THEN
      PERFORM public.award_points(p_user_id, p_tenant_id, 50, 'streak_bonus', '7일 연속 학습 보너스');
    END IF;
  ELSE
    -- 스트릭 끊김
    UPDATE public.user_gamification
    SET streak_days = 1, last_activity_date = CURRENT_DATE
    WHERE user_id = p_user_id AND tenant_id = p_tenant_id;
  END IF;
END;
$$;

-- 기본 배지 데이터 삽입
INSERT INTO public.badges (name, description, icon, badge_type, requirement_type, requirement_value, tenant_id) VALUES
('첫 걸음', '첫 강의를 완료하세요', '🎯', 'bronze', 'lessons_completed', 1, NULL),
('열정가', '10개의 강의를 완료하세요', '🔥', 'bronze', 'lessons_completed', 10, NULL),
('성실왕', '7일 연속 학습하세요', '📅', 'silver', 'streak', 7, NULL),
('마라토너', '30일 연속 학습하세요', '🏃', 'gold', 'streak', 30, NULL),
('포인트 헌터', '1000 포인트를 획득하세요', '💰', 'silver', 'points', 1000, NULL),
('포인트 마스터', '5000 포인트를 획득하세요', '💎', 'gold', 'points', 5000, NULL),
('과정 완주자', '첫 과정을 완료하세요', '🎓', 'bronze', 'courses_completed', 1, NULL),
('학습 달인', '5개의 과정을 완료하세요', '🏆', 'platinum', 'courses_completed', 5, NULL),
('과제 제출왕', '10개의 과제를 제출하세요', '📝', 'silver', 'assignments_completed', 10, NULL);

-- 트리거: 콘텐츠 완료 시 포인트 적립
CREATE OR REPLACE FUNCTION public.trigger_award_points_on_content()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    -- 사용자의 tenant_id 가져오기
    SELECT tenant_id INTO v_tenant_id
    FROM public.user_roles
    WHERE user_id = NEW.user_id
    LIMIT 1;
    
    -- 포인트 적립
    PERFORM public.award_points(NEW.user_id, v_tenant_id, 10, 'lesson_completed', '강의 완료');
    PERFORM public.update_streak(NEW.user_id, v_tenant_id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER award_points_on_content_complete
  AFTER INSERT OR UPDATE ON public.content_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_award_points_on_content();

-- 트리거: 과제 제출 시 포인트 적립
CREATE OR REPLACE FUNCTION public.trigger_award_points_on_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  IF NEW.status = 'graded' AND (OLD.status IS NULL OR OLD.status != 'graded') THEN
    SELECT tenant_id INTO v_tenant_id
    FROM public.user_roles
    WHERE user_id = NEW.user_id
    LIMIT 1;
    
    -- 점수에 따라 포인트 적립
    PERFORM public.award_points(NEW.user_id, v_tenant_id, GREATEST(5, FLOOR(COALESCE(NEW.grade, 0) / 10)), 'assignment_completed', '과제 완료');
    PERFORM public.update_streak(NEW.user_id, v_tenant_id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER award_points_on_assignment_graded
  AFTER INSERT OR UPDATE ON public.assignment_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_award_points_on_assignment();

-- 트리거: 커뮤니티 활동 포인트
CREATE OR REPLACE FUNCTION public.trigger_award_points_on_community()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  SELECT tenant_id INTO v_tenant_id
  FROM public.user_roles
  WHERE user_id = NEW.user_id
  LIMIT 1;
  
  IF TG_TABLE_NAME = 'community_posts' THEN
    PERFORM public.award_points(NEW.user_id, v_tenant_id, 5, 'community_post', '게시글 작성');
  ELSIF TG_TABLE_NAME = 'community_comments' THEN
    PERFORM public.award_points(NEW.user_id, v_tenant_id, 2, 'community_comment', '댓글 작성');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER award_points_on_post
  AFTER INSERT ON public.community_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_award_points_on_community();

CREATE TRIGGER award_points_on_comment
  AFTER INSERT ON public.community_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_award_points_on_community();

-- updated_at 트리거
CREATE TRIGGER update_user_gamification_updated_at
  BEFORE UPDATE ON public.user_gamification
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();