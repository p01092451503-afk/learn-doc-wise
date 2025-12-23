-- 문제 은행 테이블 (Quiz Question Bank)
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL DEFAULT 'multiple_choice', -- multiple_choice, true_false, short_answer
  options JSONB, -- [{text: "답안1", is_correct: false}, ...]
  correct_answer TEXT,
  points INTEGER NOT NULL DEFAULT 10,
  difficulty VARCHAR(20) DEFAULT 'medium', -- easy, medium, hard
  category VARCHAR(100),
  explanation TEXT, -- 정답 해설
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 퀴즈(시험) 테이블
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  time_limit_minutes INTEGER, -- 제한시간 (분)
  pass_score INTEGER NOT NULL DEFAULT 60, -- 합격 점수
  max_attempts INTEGER DEFAULT 3, -- 최대 응시 횟수
  shuffle_questions BOOLEAN DEFAULT true, -- 문제 랜덤 출제
  shuffle_options BOOLEAN DEFAULT true, -- 보기 순서 랜덤
  show_correct_answers BOOLEAN DEFAULT false, -- 정답 공개 여부
  question_count INTEGER NOT NULL DEFAULT 10, -- 출제 문제 수
  is_published BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 퀴즈-문제 연결 테이블
CREATE TABLE public.quiz_question_pool (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(quiz_id, question_id)
);

-- 학생 퀴즈 응시 기록
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  max_score INTEGER,
  passed BOOLEAN,
  status VARCHAR(50) DEFAULT 'in_progress', -- in_progress, submitted, graded, abandoned
  tab_switch_count INTEGER DEFAULT 0, -- 탭 이탈 횟수
  browser_warnings JSONB DEFAULT '[]'::jsonb, -- 브라우저 경고 기록
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 학생 답안 기록
CREATE TABLE public.quiz_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  selected_answer JSONB, -- 선택한 답안
  is_correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- CAPTCHA 인증 로그
CREATE TABLE public.captcha_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.course_contents(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  captcha_type VARCHAR(50) DEFAULT 'simple_math', -- simple_math, image_select, text_input
  challenge TEXT NOT NULL, -- 문제
  expected_answer TEXT NOT NULL, -- 정답
  user_answer TEXT, -- 사용자 입력
  is_verified BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 수료 기준 설정 테이블
CREATE TABLE public.completion_criteria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE UNIQUE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  min_progress_percent INTEGER NOT NULL DEFAULT 80, -- 최소 진도율
  min_quiz_score INTEGER DEFAULT 60, -- 최소 퀴즈 점수
  min_assignment_score INTEGER DEFAULT 60, -- 최소 과제 점수
  min_attendance_rate INTEGER DEFAULT 80, -- 최소 출석률
  require_all_quizzes BOOLEAN DEFAULT true, -- 모든 퀴즈 응시 필수
  require_all_assignments BOOLEAN DEFAULT false, -- 모든 과제 제출 필수
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 수료 판정 결과 테이블
CREATE TABLE public.completion_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  progress_percent NUMERIC(5,2),
  quiz_average_score NUMERIC(5,2),
  assignment_average_score NUMERIC(5,2),
  attendance_rate NUMERIC(5,2),
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  evaluation_details JSONB, -- 상세 평가 내역
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(enrollment_id)
);

-- 위험군 학습자 테이블
CREATE TABLE public.at_risk_learners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  risk_level VARCHAR(20) NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  risk_score INTEGER, -- 0-100
  risk_factors JSONB, -- {inactive_days: 14, low_progress: true, ...}
  last_activity_at TIMESTAMP WITH TIME ZONE,
  days_inactive INTEGER,
  current_progress NUMERIC(5,2),
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMP WITH TIME ZONE,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_question_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.captcha_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completion_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completion_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.at_risk_learners ENABLE ROW LEVEL SECURITY;

-- Quiz Questions 정책
CREATE POLICY "Teachers and admins can manage quiz questions"
ON public.quiz_questions FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role) OR
  is_operator(auth.uid())
);

CREATE POLICY "Students can view active quiz questions"
ON public.quiz_questions FOR SELECT
USING (is_active = true);

-- Quizzes 정책
CREATE POLICY "Teachers and admins can manage quizzes"
ON public.quizzes FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role) OR
  is_operator(auth.uid())
);

CREATE POLICY "Students can view published quizzes"
ON public.quizzes FOR SELECT
USING (is_published = true);

-- Quiz Attempts 정책
CREATE POLICY "Users can view own attempts"
ON public.quiz_attempts FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create own attempts"
ON public.quiz_attempts FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own attempts"
ON public.quiz_attempts FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all attempts"
ON public.quiz_attempts FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role) OR
  is_operator(auth.uid())
);

-- Quiz Answers 정책
CREATE POLICY "Users can manage own answers"
ON public.quiz_answers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.quiz_attempts 
    WHERE id = quiz_answers.attempt_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all answers"
ON public.quiz_answers FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role) OR
  is_operator(auth.uid())
);

-- CAPTCHA 정책
CREATE POLICY "Users can manage own captcha"
ON public.captcha_verifications FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all captcha"
ON public.captcha_verifications FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  is_operator(auth.uid())
);

-- Completion Criteria 정책
CREATE POLICY "Anyone can view completion criteria"
ON public.completion_criteria FOR SELECT
USING (true);

CREATE POLICY "Admins can manage completion criteria"
ON public.completion_criteria FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role) OR
  is_operator(auth.uid())
);

-- Completion Results 정책
CREATE POLICY "Users can view own results"
ON public.completion_results FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all results"
ON public.completion_results FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role) OR
  is_operator(auth.uid())
);

-- At Risk Learners 정책
CREATE POLICY "Admins can manage at risk learners"
ON public.at_risk_learners FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role) OR
  is_operator(auth.uid())
);

CREATE POLICY "Users can view own risk status"
ON public.at_risk_learners FOR SELECT
USING (user_id = auth.uid());

-- Quiz Question Pool 정책
CREATE POLICY "Admins can manage question pool"
ON public.quiz_question_pool FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role) OR
  is_operator(auth.uid())
);

CREATE POLICY "Students can view question pool"
ON public.quiz_question_pool FOR SELECT
USING (true);

-- 인덱스 생성
CREATE INDEX idx_quiz_questions_course ON public.quiz_questions(course_id);
CREATE INDEX idx_quiz_questions_category ON public.quiz_questions(category);
CREATE INDEX idx_quizzes_course ON public.quizzes(course_id);
CREATE INDEX idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_captcha_user ON public.captcha_verifications(user_id);
CREATE INDEX idx_at_risk_learners_user ON public.at_risk_learners(user_id);
CREATE INDEX idx_at_risk_learners_risk ON public.at_risk_learners(risk_level);
CREATE INDEX idx_completion_results_user ON public.completion_results(user_id);