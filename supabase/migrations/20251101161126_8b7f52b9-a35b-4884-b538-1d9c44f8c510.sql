-- HRD 기능 관리 테이블 생성
CREATE TABLE IF NOT EXISTS public.hrd_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key TEXT UNIQUE NOT NULL,
  feature_name TEXT NOT NULL,
  description TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  is_enabled BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  icon_name TEXT,
  route_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE public.hrd_features ENABLE ROW LEVEL SECURITY;

-- 모든 인증된 사용자가 읽을 수 있음
CREATE POLICY "Anyone can read HRD features"
ON public.hrd_features
FOR SELECT
TO authenticated
USING (true);

-- 운영자만 수정 가능 (has_role 함수 사용)
CREATE POLICY "Operators can manage HRD features"
ON public.hrd_features
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'operator'))
WITH CHECK (public.has_role(auth.uid(), 'operator'));

-- 기본 HRD 기능 데이터 삽입
INSERT INTO public.hrd_features (feature_key, feature_name, description, role, is_enabled, display_order, icon_name, route_path) VALUES
-- 학생 기능
('student_satisfaction', '만족도 조사', '훈련 과정 만족도 조사', 'student', true, 1, 'Star', '/student/satisfaction-survey'),
('student_counseling', '상담 일지', '나의 상담 기록 확인', 'student', true, 2, 'MessageSquare', '/student/counseling-log'),

-- 강사 기능
('teacher_attendance_detail', '출결 상세 관리', '지각/조퇴/결석 상세 관리', 'teacher', true, 1, 'CalendarCheck', '/teacher/attendance-detail'),
('teacher_training_log', '훈련일지 관리', '일일 훈련 내용 기록', 'teacher', true, 2, 'ClipboardList', '/teacher/training-log'),
('teacher_satisfaction', '만족도 조사', '학생 만족도 조사 관리', 'teacher', true, 3, 'Star', '/teacher/satisfaction-survey'),
('teacher_counseling', '상담일지', '학생 상담 기록 관리', 'teacher', true, 4, 'MessageSquare', '/teacher/counseling-log'),
('teacher_dropout', '중도탈락 관리', '중도탈락 위험 학생 관리', 'teacher', true, 5, 'AlertTriangle', '/teacher/dropout-management'),
('teacher_completion', '수료 요건 관리', '학생 수료 요건 체크', 'teacher', true, 6, 'Trophy', '/teacher/training-completion'),
('teacher_allowance', '훈련수당 관리', '출석 기반 훈련수당 관리', 'teacher', true, 7, 'DollarSign', '/teacher/training-allowance'),
('teacher_report', '훈련 진행 리포트', '월별 훈련 현황 보고', 'teacher', true, 8, 'FileText', '/teacher/training-report'),

-- 관리자 기능
('admin_attendance', '출석 관리', '전체 출석 현황 관리', 'admin', true, 1, 'CalendarCheck', '/admin/attendance'),
('admin_training_log', '훈련일지 관리', '전체 훈련일지 조회', 'admin', true, 2, 'ClipboardList', '/admin/training-log'),
('admin_satisfaction', '만족도 조사 관리', '전체 만족도 조사 분석', 'admin', true, 3, 'Star', '/admin/satisfaction-survey'),
('admin_counseling', '상담일지 관리', '전체 상담 기록 관리', 'admin', true, 4, 'MessageSquare', '/admin/counseling-log'),
('admin_dropout', '중도탈락 관리', '중도탈락 학생 통합 관리', 'admin', true, 5, 'AlertTriangle', '/admin/dropout-management'),
('admin_completion', '수료 관리', '수료 요건 충족 현황', 'admin', true, 6, 'Trophy', '/admin/training-completion'),
('admin_grades', '성적 관리', '전체 학생 성적 관리', 'admin', true, 7, 'Award', '/admin/grades'),
('admin_allowance', '훈련수당 관리', '전체 훈련수당 지급 관리', 'admin', true, 8, 'DollarSign', '/admin/training-allowance');

-- 업데이트 트리거 추가
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hrd_features_updated_at
BEFORE UPDATE ON public.hrd_features
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();