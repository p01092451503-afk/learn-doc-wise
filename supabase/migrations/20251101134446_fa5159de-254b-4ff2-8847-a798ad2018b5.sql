-- 훈련일지 테이블
CREATE TABLE IF NOT EXISTS public.training_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES auth.users(id),
  training_date DATE NOT NULL,
  training_hours NUMERIC(3,1) NOT NULL DEFAULT 0,
  content_summary TEXT NOT NULL,
  training_method TEXT, -- 강의, 실습, 토론 등
  materials_used TEXT,
  homework TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, training_date)
);

-- 훈련생 출결 상세 (기존 attendance 확장)
CREATE TABLE IF NOT EXISTS public.attendance_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attendance_id UUID NOT NULL REFERENCES public.attendance(id) ON DELETE CASCADE,
  late_minutes INTEGER DEFAULT 0,
  early_leave_minutes INTEGER DEFAULT 0,
  absence_reason TEXT,
  excuse_document_url TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 만족도 조사 템플릿
CREATE TABLE IF NOT EXISTS public.satisfaction_surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  survey_type VARCHAR(20) NOT NULL, -- 중간, 최종
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 만족도 조사 응답
CREATE TABLE IF NOT EXISTS public.satisfaction_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.satisfaction_surveys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(survey_id, user_id)
);

-- 중도탈락 관리
CREATE TABLE IF NOT EXISTS public.dropout_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  dropout_date DATE NOT NULL DEFAULT CURRENT_DATE,
  dropout_reason TEXT NOT NULL,
  reason_category VARCHAR(50) NOT NULL, -- 개인사정, 취업, 건강, 부적응 등
  refund_amount NUMERIC(10,2),
  refund_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, completed
  interview_notes TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 상담일지
CREATE TABLE IF NOT EXISTS public.counseling_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id),
  counselor_id UUID NOT NULL REFERENCES auth.users(id),
  course_id UUID REFERENCES public.courses(id),
  counseling_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  counseling_type VARCHAR(50) NOT NULL, -- 진로, 학습, 생활, 취업 등
  summary TEXT NOT NULL,
  student_concerns TEXT,
  counselor_advice TEXT,
  follow_up_needed BOOLEAN DEFAULT false,
  follow_up_date DATE,
  is_confidential BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 정부지원 과정 메타데이터
CREATE TABLE IF NOT EXISTS public.government_training_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE UNIQUE,
  training_type VARCHAR(50) NOT NULL, -- 국민내일배움카드, 재직자, 실업자 등
  training_provider TEXT, -- 훈련기관명
  training_number TEXT, -- 훈련과정 인정번호
  required_attendance_rate NUMERIC(3,1) DEFAULT 80.0,
  required_exam_score NUMERIC(3,1) DEFAULT 60.0,
  training_allowance NUMERIC(10,2), -- 훈련수당
  total_training_hours INTEGER,
  theory_hours INTEGER,
  practical_hours INTEGER,
  hrd_net_course_id TEXT, -- HRD-Net 과정 ID (향후 연동용)
  is_government_supported BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 정책
ALTER TABLE public.training_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satisfaction_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satisfaction_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dropout_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counseling_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_training_info ENABLE ROW LEVEL SECURITY;

-- 훈련일지 정책
CREATE POLICY "Teachers can manage training logs for their courses"
  ON public.training_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = training_logs.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all training logs"
  ON public.training_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 출결 상세 정책
CREATE POLICY "Teachers can manage attendance details"
  ON public.attendance_details
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.attendance
      JOIN public.courses ON courses.id = attendance.course_id
      WHERE attendance.id = attendance_details.attendance_id
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their attendance details"
  ON public.attendance_details
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.attendance
      WHERE attendance.id = attendance_details.attendance_id
      AND attendance.user_id = auth.uid()
    )
  );

-- 만족도 조사 정책
CREATE POLICY "Teachers can manage surveys for their courses"
  ON public.satisfaction_surveys
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = satisfaction_surveys.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Students can view active surveys"
  ON public.satisfaction_surveys
  FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.course_id = satisfaction_surveys.course_id
      AND enrollments.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can submit responses"
  ON public.satisfaction_responses
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students can view their responses"
  ON public.satisfaction_responses
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Teachers can view responses"
  ON public.satisfaction_responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.satisfaction_surveys
      JOIN public.courses ON courses.id = satisfaction_surveys.course_id
      WHERE satisfaction_surveys.id = satisfaction_responses.survey_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- 중도탈락 정책
CREATE POLICY "Teachers and admins can manage dropout records"
  ON public.dropout_records
  FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'teacher'::app_role)
  );

CREATE POLICY "Students can view their dropout records"
  ON public.dropout_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.id = dropout_records.enrollment_id
      AND enrollments.user_id = auth.uid()
    )
  );

-- 상담일지 정책
CREATE POLICY "Counselors can manage their counseling logs"
  ON public.counseling_logs
  FOR ALL
  USING (counselor_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students can view their counseling logs"
  ON public.counseling_logs
  FOR SELECT
  USING (student_id = auth.uid() AND is_confidential = false);

-- 정부지원 과정 정보 정책
CREATE POLICY "Teachers can manage government training info"
  ON public.government_training_info
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = government_training_info.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Everyone can view government training info"
  ON public.government_training_info
  FOR SELECT
  USING (true);

-- 트리거: updated_at 자동 업데이트
CREATE TRIGGER update_training_logs_updated_at
  BEFORE UPDATE ON public.training_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_counseling_logs_updated_at
  BEFORE UPDATE ON public.counseling_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_government_training_info_updated_at
  BEFORE UPDATE ON public.government_training_info
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();