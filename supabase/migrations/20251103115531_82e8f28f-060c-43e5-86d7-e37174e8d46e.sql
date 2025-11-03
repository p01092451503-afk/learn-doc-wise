-- 시스템 헬스 체크 결과 저장 테이블
CREATE TABLE IF NOT EXISTS public.health_check_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  executed_by UUID REFERENCES auth.users(id),
  overall_status TEXT NOT NULL CHECK (overall_status IN ('healthy', 'degraded', 'critical')),
  total_checks INTEGER NOT NULL DEFAULT 0,
  passed_checks INTEGER NOT NULL DEFAULT 0,
  failed_checks INTEGER NOT NULL DEFAULT 0,
  warning_checks INTEGER NOT NULL DEFAULT 0,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_analysis TEXT,
  recommendations JSONB DEFAULT '[]'::jsonb,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 시스템 메트릭 저장 테이블 (실시간 모니터링용)
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('api_response_time', 'error_rate', 'active_users', 'db_connections', 'storage_usage', 'function_calls')),
  metric_value NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 기능별 상태 추적 테이블
CREATE TABLE IF NOT EXISTS public.feature_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  feature_category TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('operational', 'warning', 'error', 'incomplete', 'enhancement_needed')),
  status_message TEXT,
  last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  error_count INTEGER DEFAULT 0,
  uptime_percentage NUMERIC DEFAULT 100.0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id, feature_name)
);

-- RLS 정책 설정
ALTER TABLE public.health_check_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_status ENABLE ROW LEVEL SECURITY;

-- health_check_results 정책
CREATE POLICY "Admins and operators can view health checks"
  ON public.health_check_results FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'operator'::app_role)
  );

CREATE POLICY "Admins and operators can insert health checks"
  ON public.health_check_results FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'operator'::app_role)
  );

-- system_metrics 정책
CREATE POLICY "Admins and operators can view metrics"
  ON public.system_metrics FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'operator'::app_role)
  );

CREATE POLICY "Admins and operators can insert metrics"
  ON public.system_metrics FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'operator'::app_role)
  );

-- feature_status 정책
CREATE POLICY "Admins and operators can view feature status"
  ON public.feature_status FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'operator'::app_role)
  );

CREATE POLICY "Admins and operators can manage feature status"
  ON public.feature_status FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'operator'::app_role)
  );

-- 인덱스 추가 (성능 최적화)
CREATE INDEX idx_health_check_results_created_at ON public.health_check_results(created_at DESC);
CREATE INDEX idx_health_check_results_tenant ON public.health_check_results(tenant_id);
CREATE INDEX idx_system_metrics_recorded_at ON public.system_metrics(recorded_at DESC);
CREATE INDEX idx_system_metrics_type ON public.system_metrics(metric_type);
CREATE INDEX idx_feature_status_tenant ON public.feature_status(tenant_id);
CREATE INDEX idx_feature_status_status ON public.feature_status(status);

-- 자동 updated_at 업데이트 트리거
CREATE TRIGGER update_health_check_results_updated_at
  BEFORE UPDATE ON public.health_check_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feature_status_updated_at
  BEFORE UPDATE ON public.feature_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();