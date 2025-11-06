-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Operators can view system settings" ON public.system_settings;

-- Create new SELECT policy: All authenticated users can read system settings
CREATE POLICY "Anyone can view system settings"
  ON public.system_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Keep INSERT/UPDATE policies for operators only
-- (existing policies are already correct)