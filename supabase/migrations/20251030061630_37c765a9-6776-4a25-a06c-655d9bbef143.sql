-- Fix RLS policies for categories table to allow admin to create categories
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

-- Create separate policies for each operation
CREATE POLICY "Admins can view all categories"
  ON public.categories FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Fix tags table policies as well
DROP POLICY IF EXISTS "Admins can manage tags" ON public.tags;

CREATE POLICY "Admins can view all tags"
  ON public.tags FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert tags"
  ON public.tags FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tags"
  ON public.tags FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tags"
  ON public.tags FOR DELETE
  USING (has_role(auth.uid(), 'admin'));