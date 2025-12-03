-- 사용자 세션 관리 테이블 (동시 접속 차단용)
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  device_info JSONB DEFAULT '{}',
  ip_address INET,
  is_active BOOLEAN DEFAULT true,
  last_heartbeat_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours')
);

-- KDT 컴플라이언스 로그 테이블
CREATE TABLE IF NOT EXISTS public.kdt_compliance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_id UUID,
  course_id UUID,
  event_type TEXT NOT NULL, -- 'speed_violation', 'dual_monitor', 'focus_out', 'concurrent_login', 'progress_skip_attempt'
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_kdt_compliance_logs_user_id ON public.kdt_compliance_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_kdt_compliance_logs_event_type ON public.kdt_compliance_logs(event_type);

-- RLS 활성화
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kdt_compliance_logs ENABLE ROW LEVEL SECURITY;

-- user_sessions RLS 정책
CREATE POLICY "Users can view own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- kdt_compliance_logs RLS 정책
CREATE POLICY "Users can insert own logs" ON public.kdt_compliance_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all logs" ON public.kdt_compliance_logs
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'teacher'::app_role) OR
    is_operator(auth.uid())
  );

-- 오래된 세션 정리 함수
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_sessions
  SET is_active = false
  WHERE is_active = true
    AND (expires_at < now() OR last_heartbeat_at < now() - interval '5 minutes');
END;
$$;