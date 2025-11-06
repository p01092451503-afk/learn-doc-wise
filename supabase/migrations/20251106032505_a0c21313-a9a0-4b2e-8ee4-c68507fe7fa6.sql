-- Enable SELECT for authenticated users on categories table
-- Everyone can view active categories
CREATE POLICY "Anyone can view active categories"
ON public.categories
FOR SELECT
TO authenticated
USING (is_active = true);

-- Admins can view all categories including inactive ones
CREATE POLICY "Admins can view all categories"
ON public.categories
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);