-- Create enum for assignment status
CREATE TYPE assignment_status AS ENUM ('draft', 'published', 'closed');

-- Create enum for submission status
CREATE TYPE submission_status AS ENUM ('submitted', 'graded', 'returned', 'late');

-- Assignments table
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  max_score INTEGER NOT NULL DEFAULT 100,
  due_date TIMESTAMP WITH TIME ZONE,
  status assignment_status NOT NULL DEFAULT 'draft',
  allow_late_submission BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Assignment submissions
CREATE TABLE public.assignment_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_text TEXT,
  file_urls TEXT[],
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status submission_status NOT NULL DEFAULT 'submitted',
  score INTEGER,
  feedback TEXT,
  graded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  graded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(assignment_id, student_id)
);

-- Course progress tracking
CREATE TABLE public.course_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  time_spent_minutes INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(enrollment_id, lesson_id)
);

-- Grades table
CREATE TABLE public.grades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
  score DECIMAL(5, 2) NOT NULL,
  max_score DECIMAL(5, 2) NOT NULL,
  percentage DECIMAL(5, 2) GENERATED ALWAYS AS ((score / max_score) * 100) STORED,
  grade_type TEXT NOT NULL,
  notes TEXT,
  graded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  graded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Learning analytics table
CREATE TABLE public.learning_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  total_time_minutes INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  engagement_score DECIMAL(5, 2),
  at_risk_score DECIMAL(5, 2),
  learning_pattern JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  certificate_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assignments
CREATE POLICY "Students can view published assignments"
  ON public.assignments FOR SELECT
  USING (
    status = 'published' AND
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.course_id = assignments.course_id
      AND enrollments.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage their course assignments"
  ON public.assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = assignments.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all assignments"
  ON public.assignments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for assignment_submissions
CREATE POLICY "Students can view their submissions"
  ON public.assignment_submissions FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can submit assignments"
  ON public.assignment_submissions FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their ungraded submissions"
  ON public.assignment_submissions FOR UPDATE
  USING (student_id = auth.uid() AND status = 'submitted');

CREATE POLICY "Teachers can view and grade submissions for their courses"
  ON public.assignment_submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.assignments
      JOIN public.courses ON courses.id = assignments.course_id
      WHERE assignments.id = assignment_submissions.assignment_id
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all submissions"
  ON public.assignment_submissions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for course_progress
CREATE POLICY "Students can view and update their progress"
  ON public.course_progress FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.id = course_progress.enrollment_id
      AND enrollments.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view progress for their courses"
  ON public.course_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      JOIN public.courses ON courses.id = enrollments.course_id
      WHERE enrollments.id = course_progress.enrollment_id
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all progress"
  ON public.course_progress FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for grades
CREATE POLICY "Students can view their grades"
  ON public.grades FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.id = grades.enrollment_id
      AND enrollments.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage grades for their courses"
  ON public.grades FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      JOIN public.courses ON courses.id = enrollments.course_id
      WHERE enrollments.id = grades.enrollment_id
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all grades"
  ON public.grades FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for learning_analytics
CREATE POLICY "Students can view their analytics"
  ON public.learning_analytics FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Teachers can view analytics for their courses"
  ON public.learning_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = learning_analytics.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all analytics"
  ON public.learning_analytics FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can update analytics"
  ON public.learning_analytics FOR ALL
  USING (true);

-- RLS Policies for certificates
CREATE POLICY "Users can view their certificates"
  ON public.certificates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.id = certificates.enrollment_id
      AND enrollments.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all certificates"
  ON public.certificates FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes
CREATE INDEX idx_assignments_course ON public.assignments(course_id);
CREATE INDEX idx_assignments_status ON public.assignments(status);
CREATE INDEX idx_submissions_assignment ON public.assignment_submissions(assignment_id);
CREATE INDEX idx_submissions_student ON public.assignment_submissions(student_id);
CREATE INDEX idx_submissions_status ON public.assignment_submissions(status);
CREATE INDEX idx_progress_enrollment ON public.course_progress(enrollment_id);
CREATE INDEX idx_grades_enrollment ON public.grades(enrollment_id);
CREATE INDEX idx_analytics_user_course ON public.learning_analytics(user_id, course_id);
CREATE INDEX idx_certificates_enrollment ON public.certificates(enrollment_id);

-- Create triggers
CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_analytics_updated_at
  BEFORE UPDATE ON public.learning_analytics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update enrollment progress
CREATE OR REPLACE FUNCTION update_enrollment_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_total_lessons INTEGER;
  v_completed_lessons INTEGER;
  v_new_progress DECIMAL;
BEGIN
  -- Count total and completed lessons
  SELECT COUNT(*), COUNT(*) FILTER (WHERE completed = true)
  INTO v_total_lessons, v_completed_lessons
  FROM public.course_progress
  WHERE enrollment_id = NEW.enrollment_id;
  
  -- Calculate progress percentage
  IF v_total_lessons > 0 THEN
    v_new_progress := (v_completed_lessons::DECIMAL / v_total_lessons::DECIMAL) * 100;
    
    -- Update enrollment progress
    UPDATE public.enrollments
    SET progress = v_new_progress,
        completed_at = CASE WHEN v_new_progress >= 100 THEN now() ELSE NULL END
    WHERE id = NEW.enrollment_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_progress_trigger
  AFTER INSERT OR UPDATE ON public.course_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_enrollment_progress();