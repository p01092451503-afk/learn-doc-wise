-- Completely rebuild categories RLS policies
-- First, drop ALL existing policies
DROP POLICY IF EXISTS "Everyone can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can view all categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;

-- Create new comprehensive policies
-- Allow everyone to view active categories
CREATE POLICY "Public can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = true);

-- Allow authenticated users with admin role to do everything
CREATE POLICY "Authenticated admins can manage categories"
  ON public.categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Do the same for tags table
DROP POLICY IF EXISTS "Everyone can view tags" ON public.tags;
DROP POLICY IF EXISTS "Admins can view all tags" ON public.tags;
DROP POLICY IF EXISTS "Admins can insert tags" ON public.tags;
DROP POLICY IF EXISTS "Admins can update tags" ON public.tags;
DROP POLICY IF EXISTS "Admins can delete tags" ON public.tags;

CREATE POLICY "Public can view all tags"
  ON public.tags FOR SELECT
  USING (true);

CREATE POLICY "Authenticated admins can manage tags"
  ON public.tags
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );