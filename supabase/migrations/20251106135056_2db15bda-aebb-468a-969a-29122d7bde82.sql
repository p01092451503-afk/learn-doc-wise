-- Create system_settings table for platform-wide settings
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Operators can view system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Operators can insert system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Operators can update system settings" ON public.system_settings;

-- Only operators can view and modify system settings
CREATE POLICY "Operators can view system settings"
  ON public.system_settings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'operator'
    )
  );

CREATE POLICY "Operators can insert system settings"
  ON public.system_settings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'operator'
    )
  );

CREATE POLICY "Operators can update system settings"
  ON public.system_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'operator'
    )
  );

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON public.system_settings;

-- Create trigger for updated_at
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default HRD visibility setting
INSERT INTO public.system_settings (setting_key, setting_value)
VALUES ('hide_hrd_features', '{"enabled": false}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;