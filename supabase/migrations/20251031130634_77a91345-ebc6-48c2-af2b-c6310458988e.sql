-- 마이크로러닝 (Microlearning) 시스템

-- 1. 일일 학습 목표 테이블
CREATE TABLE IF NOT EXISTS public.daily_learning_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  goal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_minutes INTEGER NOT NULL DEFAULT 15,
  target_lessons INTEGER NOT NULL DEFAULT 3,
  completed_minutes INTEGER NOT NULL DEFAULT 0,
  completed_lessons INTEGER NOT NULL DEFAULT 0,
  goal_achieved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, goal_date)
);

-- 2. 학습 리마인더 테이블
CREATE TABLE IF NOT EXISTS public.learning_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('daily', 'weekly', 'custom')),
  reminder_time TIME NOT NULL DEFAULT '09:00:00',
  days_of_week INTEGER[] NOT NULL DEFAULT ARRAY[1,2,3,4,5], -- 1=Monday, 7=Sunday
  is_active BOOLEAN NOT NULL DEFAULT true,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. 학습 세션 테이블 (포모도로 타이머 등)
CREATE TABLE IF NOT EXISTS public.learning_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.course_contents(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  session_type TEXT NOT NULL DEFAULT 'micro' CHECK (session_type IN ('micro', 'standard', 'extended')),
  duration_minutes INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN NOT NULL DEFAULT false,
  focus_score INTEGER CHECK (focus_score >= 1 AND focus_score <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. 오프라인 콘텐츠 다운로드 테이블
CREATE TABLE IF NOT EXISTS public.offline_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.course_contents(id) ON DELETE CASCADE,
  download_status TEXT NOT NULL DEFAULT 'pending' CHECK (download_status IN ('pending', 'downloaded', 'expired', 'deleted')),
  download_size_mb NUMERIC,
  downloaded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  access_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_id)
);

-- 5. 학습 스트릭 기록 테이블 (게이미피케이션과 연동)
CREATE TABLE IF NOT EXISTS public.learning_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  streak_date DATE NOT NULL,
  minutes_learned INTEGER NOT NULL DEFAULT 0,
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  goal_achieved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, streak_date)
);

-- RLS 정책 설정
ALTER TABLE public.daily_learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_streaks ENABLE ROW LEVEL SECURITY;

-- daily_learning_goals RLS
CREATE POLICY "Users can view their own goals"
  ON public.daily_learning_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their goals"
  ON public.daily_learning_goals FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all goals"
  ON public.daily_learning_goals FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- learning_reminders RLS
CREATE POLICY "Users can manage their reminders"
  ON public.learning_reminders FOR ALL
  USING (auth.uid() = user_id);

-- learning_sessions RLS
CREATE POLICY "Users can view their sessions"
  ON public.learning_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create sessions"
  ON public.learning_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their sessions"
  ON public.learning_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
  ON public.learning_sessions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- offline_downloads RLS
CREATE POLICY "Users can manage their downloads"
  ON public.offline_downloads FOR ALL
  USING (auth.uid() = user_id);

-- learning_streaks RLS
CREATE POLICY "Users can view their streaks"
  ON public.learning_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage streaks"
  ON public.learning_streaks FOR ALL
  USING (true);

CREATE POLICY "Admins can view all streaks"
  ON public.learning_streaks FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 일일 목표 업데이트 함수
CREATE OR REPLACE FUNCTION public.update_daily_goal_progress(
  p_user_id UUID,
  p_minutes INTEGER,
  p_lessons INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- 사용자의 tenant_id 가져오기
  SELECT tenant_id INTO v_tenant_id
  FROM public.user_roles
  WHERE user_id = p_user_id
  LIMIT 1;

  -- 일일 목표 업데이트 또는 생성
  INSERT INTO public.daily_learning_goals (
    user_id,
    tenant_id,
    goal_date,
    completed_minutes,
    completed_lessons,
    goal_achieved
  )
  VALUES (
    p_user_id,
    v_tenant_id,
    CURRENT_DATE,
    p_minutes,
    p_lessons,
    false
  )
  ON CONFLICT (user_id, goal_date)
  DO UPDATE SET
    completed_minutes = daily_learning_goals.completed_minutes + p_minutes,
    completed_lessons = daily_learning_goals.completed_lessons + p_lessons,
    goal_achieved = (
      (daily_learning_goals.completed_minutes + p_minutes) >= daily_learning_goals.target_minutes
      AND
      (daily_learning_goals.completed_lessons + p_lessons) >= daily_learning_goals.target_lessons
    ),
    updated_at = now();

  -- 스트릭 업데이트
  INSERT INTO public.learning_streaks (
    user_id,
    tenant_id,
    streak_date,
    minutes_learned,
    lessons_completed
  )
  VALUES (
    p_user_id,
    v_tenant_id,
    CURRENT_DATE,
    p_minutes,
    p_lessons
  )
  ON CONFLICT (user_id, streak_date)
  DO UPDATE SET
    minutes_learned = learning_streaks.minutes_learned + p_minutes,
    lessons_completed = learning_streaks.lessons_completed + p_lessons;
END;
$$;

-- 학습 세션 완료 시 목표 업데이트 트리거
CREATE OR REPLACE FUNCTION public.trigger_update_daily_goal_on_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    PERFORM public.update_daily_goal_progress(
      NEW.user_id,
      NEW.duration_minutes,
      1
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_daily_goal_on_session_complete
  AFTER INSERT OR UPDATE ON public.learning_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_daily_goal_on_session();

-- updated_at 트리거
CREATE TRIGGER update_daily_learning_goals_updated_at
  BEFORE UPDATE ON public.daily_learning_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_reminders_updated_at
  BEFORE UPDATE ON public.learning_reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();