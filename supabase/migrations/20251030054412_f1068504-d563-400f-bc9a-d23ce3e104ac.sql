-- Create enum for course status
CREATE TYPE course_status AS ENUM ('draft', 'published', 'scheduled', 'archived');

-- Create enum for course level
CREATE TYPE course_level AS ENUM ('beginner', 'intermediate', 'advanced', 'all');

-- Categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tags table
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  thumbnail_url TEXT,
  instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  level course_level NOT NULL DEFAULT 'beginner',
  status course_status NOT NULL DEFAULT 'draft',
  price DECIMAL(10, 2) DEFAULT 0,
  duration_hours INTEGER DEFAULT 0,
  max_students INTEGER,
  publish_date TIMESTAMP WITH TIME ZONE,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Course tags junction table
CREATE TABLE public.course_tags (
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, tag_id)
);

-- Course versions table (for content version management)
CREATE TABLE public.course_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, version)
);

-- Course enrollments
CREATE TABLE public.enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress DECIMAL(5, 2) DEFAULT 0,
  UNIQUE(course_id, user_id)
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "Everyone can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for tags
CREATE POLICY "Everyone can view tags"
  ON public.tags FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage tags"
  ON public.tags FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for courses
CREATE POLICY "Everyone can view published courses"
  ON public.courses FOR SELECT
  USING (
    status = 'published' 
    AND (publish_date IS NULL OR publish_date <= now())
  );

CREATE POLICY "Teachers can view their own courses"
  ON public.courses FOR SELECT
  USING (
    public.has_role(auth.uid(), 'teacher') 
    AND instructor_id = auth.uid()
  );

CREATE POLICY "Admins can view all courses"
  ON public.courses FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can create courses"
  ON public.courses FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'teacher')
    AND instructor_id = auth.uid()
  );

CREATE POLICY "Teachers can update their own courses"
  ON public.courses FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'teacher')
    AND instructor_id = auth.uid()
  );

CREATE POLICY "Admins can manage all courses"
  ON public.courses FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for course_tags
CREATE POLICY "Everyone can view course tags"
  ON public.course_tags FOR SELECT
  USING (true);

CREATE POLICY "Teachers and admins can manage course tags"
  ON public.course_tags FOR ALL
  USING (
    public.has_role(auth.uid(), 'teacher') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for course_versions
CREATE POLICY "Instructors can view their course versions"
  ON public.course_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = course_versions.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all course versions"
  ON public.course_versions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Instructors and admins can create versions"
  ON public.course_versions FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'teacher') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for enrollments
CREATE POLICY "Students can view their own enrollments"
  ON public.enrollments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Teachers can view enrollments for their courses"
  ON public.enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = enrollments.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all enrollments"
  ON public.enrollments FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can enroll in courses"
  ON public.enrollments FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create indexes
CREATE INDEX idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX idx_courses_category ON public.courses(category_id);
CREATE INDEX idx_courses_status ON public.courses(status);
CREATE INDEX idx_courses_publish_date ON public.courses(publish_date);
CREATE INDEX idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX idx_categories_parent ON public.categories(parent_id);

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create a new version when course content is updated
CREATE OR REPLACE FUNCTION create_course_version()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.title != NEW.title OR OLD.description != NEW.description THEN
    INSERT INTO public.course_versions (
      course_id,
      version,
      title,
      description,
      created_by
    ) VALUES (
      NEW.id,
      NEW.version,
      OLD.title,
      OLD.description,
      auth.uid()
    );
    
    NEW.version = NEW.version + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER course_version_trigger
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION create_course_version();