-- 헬스 체크 로그 테이블 생성
CREATE TABLE IF NOT EXISTS public.ai_health_check_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_id TEXT NOT NULL,
  overall_status TEXT NOT NULL CHECK (overall_status IN ('healthy', 'degraded', 'critical')),
  total_checks INTEGER NOT NULL,
  passed_checks INTEGER NOT NULL,
  failed_checks INTEGER NOT NULL,
  warning_checks INTEGER NOT NULL,
  checks JSONB NOT NULL,
  ai_analysis TEXT,
  recommendations JSONB,
  execution_time INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_health_check_logs_created_at ON public.ai_health_check_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_check_logs_status ON public.ai_health_check_logs(overall_status);

-- RLS 활성화
ALTER TABLE public.ai_health_check_logs ENABLE ROW LEVEL SECURITY;

-- 관리자만 조회 가능
CREATE POLICY "Admins can view health check logs"
  ON public.ai_health_check_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- 관리자만 삽입 가능
CREATE POLICY "Admins can insert health check logs"
  ON public.ai_health_check_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );