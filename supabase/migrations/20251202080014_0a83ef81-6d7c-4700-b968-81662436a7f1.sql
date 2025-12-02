-- Create cohorts table for tracking training cohorts
CREATE TABLE IF NOT EXISTS public.cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id),
  course_id UUID REFERENCES public.courses(id),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add cohort_id to enrollments
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS cohort_id UUID REFERENCES public.cohorts(id);

-- Create student_activity_tracking table for real-time monitoring
CREATE TABLE IF NOT EXISTS public.student_activity_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id),
  cohort_id UUID REFERENCES public.cohorts(id),
  is_online BOOLEAN DEFAULT false,
  is_focused BOOLEAN DEFAULT true,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  last_mouse_movement_at TIMESTAMPTZ DEFAULT now(),
  current_content_id UUID REFERENCES public.course_contents(id),
  session_start_at TIMESTAMPTZ DEFAULT now(),
  tenant_id UUID REFERENCES public.tenants(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_activity_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cohorts
CREATE POLICY "Admins can manage cohorts"
  ON public.cohorts
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Teachers can view cohorts"
  ON public.cohorts
  FOR SELECT
  USING (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for student_activity_tracking
CREATE POLICY "Admins and teachers can view activity"
  ON public.student_activity_tracking
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Students can update their own activity"
  ON public.student_activity_tracking
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity"
  ON public.student_activity_tracking
  FOR INSERT
  WITH CHECK (true);

-- Enable realtime for activity tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_activity_tracking;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_activity_user_id ON public.student_activity_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_student_activity_cohort_id ON public.student_activity_tracking(cohort_id);
CREATE INDEX IF NOT EXISTS idx_student_activity_updated_at ON public.student_activity_tracking(updated_at);
CREATE INDEX IF NOT EXISTS idx_cohorts_course_id ON public.cohorts(course_id);
CREATE INDEX IF NOT EXISTS idx_cohorts_is_active ON public.cohorts(is_active);

-- Update timestamp trigger for cohorts
CREATE TRIGGER update_cohorts_updated_at
  BEFORE UPDATE ON public.cohorts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update timestamp trigger for student_activity_tracking
CREATE TRIGGER update_student_activity_tracking_updated_at
  BEFORE UPDATE ON public.student_activity_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();