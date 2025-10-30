-- Module 5: Content Management
-- Content type enum
CREATE TYPE content_type AS ENUM ('video', 'document', 'quiz', 'assignment');

-- Video provider enum
CREATE TYPE video_provider AS ENUM ('youtube', 'vimeo', 'direct');

-- Course contents table
CREATE TABLE public.course_contents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_type content_type NOT NULL DEFAULT 'video',
  video_url TEXT,
  video_provider video_provider,
  duration_minutes INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_preview BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.course_contents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_contents
CREATE POLICY "Everyone can view published contents"
  ON public.course_contents FOR SELECT
  USING (is_published = true);

CREATE POLICY "Teachers can manage their course contents"
  ON public.course_contents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = course_contents.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all contents"
  ON public.course_contents FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Content progress table (tracks video progress)
CREATE TABLE public.content_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.course_contents(id) ON DELETE CASCADE,
  progress_percentage DECIMAL NOT NULL DEFAULT 0,
  last_position_seconds INTEGER DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_id)
);

-- Enable RLS
ALTER TABLE public.content_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_progress
CREATE POLICY "Users can view their own progress"
  ON public.content_progress FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own progress"
  ON public.content_progress FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own progress"
  ON public.content_progress FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all progress"
  ON public.content_progress FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view progress for their courses"
  ON public.content_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.course_contents
      JOIN public.courses ON courses.id = course_contents.course_id
      WHERE course_contents.id = content_progress.content_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_course_contents_course ON public.course_contents(course_id);
CREATE INDEX idx_course_contents_order ON public.course_contents(course_id, order_index);
CREATE INDEX idx_content_progress_user ON public.content_progress(user_id);
CREATE INDEX idx_content_progress_content ON public.content_progress(content_id);

-- Triggers
CREATE TRIGGER update_course_contents_updated_at
  BEFORE UPDATE ON public.course_contents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update content progress
CREATE OR REPLACE FUNCTION update_content_progress(
  p_user_id UUID,
  p_content_id UUID,
  p_progress_percentage DECIMAL,
  p_last_position_seconds INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.content_progress (
    user_id,
    content_id,
    progress_percentage,
    last_position_seconds,
    completed,
    completed_at,
    last_accessed_at
  ) VALUES (
    p_user_id,
    p_content_id,
    p_progress_percentage,
    p_last_position_seconds,
    p_progress_percentage >= 90,
    CASE WHEN p_progress_percentage >= 90 THEN now() ELSE NULL END,
    now()
  )
  ON CONFLICT (user_id, content_id)
  DO UPDATE SET
    progress_percentage = EXCLUDED.progress_percentage,
    last_position_seconds = EXCLUDED.last_position_seconds,
    completed = EXCLUDED.completed,
    completed_at = EXCLUDED.completed_at,
    last_accessed_at = now();
END;
$$;