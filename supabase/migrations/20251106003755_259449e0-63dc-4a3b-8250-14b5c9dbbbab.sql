-- Fix categories table RLS policies to allow admins to create categories
-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Authenticated admins can manage categories" ON public.categories;

-- Create new policies using the has_role function
CREATE POLICY "Admins can manage all categories"
ON public.categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow teachers to manage categories as well
CREATE POLICY "Teachers can manage categories"
ON public.categories
FOR ALL
USING (has_role(auth.uid(), 'teacher'::app_role))
WITH CHECK (has_role(auth.uid(), 'teacher'::app_role));