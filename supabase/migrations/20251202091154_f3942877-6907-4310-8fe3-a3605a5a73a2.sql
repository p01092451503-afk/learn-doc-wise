-- Create student_activity_status table for real-time monitoring
CREATE TABLE IF NOT EXISTS public.student_activity_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id),
  cohort_id UUID REFERENCES public.cohorts(id),
  current_course_id UUID REFERENCES public.courses(id),
  current_content_id UUID REFERENCES public.course_contents(id),
  progress_percentage NUMERIC DEFAULT 0,
  is_online BOOLEAN DEFAULT false,
  is_focus BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('active', 'focus_out', 'idle', 'offline')),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_heartbeat_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, cohort_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_activity_cohort ON public.student_activity_status(cohort_id);
CREATE INDEX IF NOT EXISTS idx_student_activity_user ON public.student_activity_status(user_id);
CREATE INDEX IF NOT EXISTS idx_student_activity_status ON public.student_activity_status(status);
CREATE INDEX IF NOT EXISTS idx_student_activity_tenant ON public.student_activity_status(tenant_id);

-- Enable Row Level Security
ALTER TABLE public.student_activity_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_activity_status
CREATE POLICY "Admins can view all student activity in their tenant"
  ON public.student_activity_status
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    AND tenant_id = get_user_tenant_id(auth.uid())
  );

CREATE POLICY "Students can update their own activity status"
  ON public.student_activity_status
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert their own activity status"
  ON public.student_activity_status
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Operators can view all student activity"
  ON public.student_activity_status
  FOR SELECT
  USING (has_role(auth.uid(), 'operator'::app_role));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_student_activity_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_student_activity_status_updated_at
  BEFORE UPDATE ON public.student_activity_status
  FOR EACH ROW
  EXECUTE FUNCTION update_student_activity_updated_at();

-- Enable realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_activity_status;