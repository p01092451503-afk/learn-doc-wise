-- 알림 시스템을 위한 테이블 생성
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'assignment', 'course_update', 'encouragement', 'achievement', 'message'
  priority TEXT NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- 알림 환경설정 테이블
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  assignment_reminders BOOLEAN NOT NULL DEFAULT true,
  course_updates BOOLEAN NOT NULL DEFAULT true,
  encouragement_messages BOOLEAN NOT NULL DEFAULT true,
  achievement_notifications BOOLEAN NOT NULL DEFAULT true,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 자동 독려 규칙 테이블
CREATE TABLE IF NOT EXISTS public.auto_encouragement_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  rule_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  trigger_type TEXT NOT NULL, -- 'no_activity', 'low_progress', 'missed_deadline', 'streak_broken'
  days_threshold INTEGER NOT NULL DEFAULT 7,
  progress_threshold NUMERIC,
  message_template TEXT NOT NULL,
  target_role TEXT NOT NULL DEFAULT 'student', -- 'student', 'teacher'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 독려 메시지 발송 이력
CREATE TABLE IF NOT EXISTS public.encouragement_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  rule_id UUID REFERENCES public.auto_encouragement_rules(id),
  notification_id UUID REFERENCES public.notifications(id),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  trigger_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_encouragement_logs_user_id ON public.encouragement_logs(user_id);

-- RLS 정책
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_encouragement_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encouragement_logs ENABLE ROW LEVEL SECURITY;

-- 알림 정책
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins and teachers can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'teacher')
    )
  );

-- 알림 환경설정 정책
CREATE POLICY "Users can manage their notification preferences"
  ON public.notification_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 자동 독려 규칙 정책
CREATE POLICY "Admins can manage encouragement rules"
  ON public.auto_encouragement_rules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Teachers can view encouragement rules"
  ON public.auto_encouragement_rules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'teacher')
    )
  );

-- 독려 로그 정책
CREATE POLICY "Users can view their encouragement logs"
  ON public.encouragement_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all encouragement logs"
  ON public.encouragement_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 함수: 알림 생성
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_tenant_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_priority TEXT DEFAULT 'normal',
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
  v_prefs RECORD;
BEGIN
  -- 사용자 알림 환경설정 확인
  SELECT * INTO v_prefs
  FROM public.notification_preferences
  WHERE user_id = p_user_id;
  
  -- 환경설정이 없으면 기본값으로 생성
  IF NOT FOUND THEN
    INSERT INTO public.notification_preferences (user_id)
    VALUES (p_user_id);
    v_prefs := ROW(gen_random_uuid(), p_user_id, true, true, true, true, true, true, NULL, NULL, now(), now());
  END IF;
  
  -- 타입별 알림 허용 확인
  IF (p_type = 'assignment' AND NOT v_prefs.assignment_reminders) OR
     (p_type = 'course_update' AND NOT v_prefs.course_updates) OR
     (p_type = 'encouragement' AND NOT v_prefs.encouragement_messages) OR
     (p_type = 'achievement' AND NOT v_prefs.achievement_notifications) THEN
    RETURN NULL; -- 알림 비활성화됨
  END IF;
  
  -- 알림 생성
  INSERT INTO public.notifications (
    user_id,
    tenant_id,
    title,
    message,
    type,
    priority,
    action_url,
    metadata
  ) VALUES (
    p_user_id,
    p_tenant_id,
    p_title,
    p_message,
    p_type,
    p_priority,
    p_action_url,
    p_metadata
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- 트리거: 과제 마감 알림
CREATE OR REPLACE FUNCTION public.trigger_assignment_deadline_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_enrollment RECORD;
  v_tenant_id UUID;
BEGIN
  -- 새로 생성되거나 마감일이 설정된 과제에 대해
  IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.due_date IS DISTINCT FROM NEW.due_date))
     AND NEW.due_date IS NOT NULL AND NEW.status = 'published' THEN
    
    -- 강의에 등록된 모든 학생에게 알림
    FOR v_enrollment IN
      SELECT DISTINCT e.user_id, ur.tenant_id
      FROM public.enrollments e
      JOIN public.user_roles ur ON ur.user_id = e.user_id
      WHERE e.course_id = NEW.course_id
    LOOP
      PERFORM public.create_notification(
        v_enrollment.user_id,
        v_enrollment.tenant_id,
        '새 과제가 등록되었습니다',
        NEW.title || ' - 마감: ' || to_char(NEW.due_date, 'YYYY-MM-DD HH24:MI'),
        'assignment',
        'normal',
        '/student/assignments',
        jsonb_build_object('assignment_id', NEW.id, 'due_date', NEW.due_date)
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER assignment_deadline_notification
  AFTER INSERT OR UPDATE ON public.assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_assignment_deadline_notification();

-- 트리거: 강의 업데이트 알림
CREATE OR REPLACE FUNCTION public.trigger_course_update_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_enrollment RECORD;
BEGIN
  -- 강의가 게시되거나 중요 정보가 업데이트될 때
  IF (TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status = 'published') OR
     (TG_OP = 'UPDATE' AND (OLD.title IS DISTINCT FROM NEW.title OR OLD.description IS DISTINCT FROM NEW.description)) THEN
    
    FOR v_enrollment IN
      SELECT DISTINCT e.user_id, ur.tenant_id
      FROM public.enrollments e
      JOIN public.user_roles ur ON ur.user_id = e.user_id
      WHERE e.course_id = NEW.id
    LOOP
      PERFORM public.create_notification(
        v_enrollment.user_id,
        v_enrollment.tenant_id,
        '강의가 업데이트되었습니다',
        NEW.title || '에 새로운 업데이트가 있습니다.',
        'course_update',
        'normal',
        '/student/courses/' || NEW.id,
        jsonb_build_object('course_id', NEW.id)
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER course_update_notification
  AFTER UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_course_update_notification();