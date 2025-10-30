-- Fix RLS policy for courses table to allow admins to create courses
-- Drop existing policies
DROP POLICY IF EXISTS "Teachers can create courses" ON public.courses;
DROP POLICY IF EXISTS "Teachers can update their own courses" ON public.courses;
DROP POLICY IF EXISTS "Teachers can view their own courses" ON public.courses;

-- Recreate policies with admin support
CREATE POLICY "Teachers and admins can create courses"
  ON public.courses FOR INSERT
  WITH CHECK (
    (has_role(auth.uid(), 'teacher') AND instructor_id = auth.uid()) OR
    has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Teachers and admins can update courses"
  ON public.courses FOR UPDATE
  USING (
    (has_role(auth.uid(), 'teacher') AND instructor_id = auth.uid()) OR
    has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Teachers can view their own courses"
  ON public.courses FOR SELECT
  USING (
    (has_role(auth.uid(), 'teacher') AND instructor_id = auth.uid())
  );