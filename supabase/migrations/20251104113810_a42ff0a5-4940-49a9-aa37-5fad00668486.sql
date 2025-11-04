-- Create platform_settings table for storing platform-wide settings
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Create policies - only admins can manage platform settings
CREATE POLICY "Anyone can view platform settings"
ON public.platform_settings
FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert platform settings"
ON public.platform_settings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update platform settings"
ON public.platform_settings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can delete platform settings"
ON public.platform_settings
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_platform_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_platform_settings_updated_at
BEFORE UPDATE ON public.platform_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_platform_settings_updated_at();

-- Insert default HRD setting
INSERT INTO public.platform_settings (key, value, description)
VALUES ('hrd_enabled', 'true'::jsonb, 'Enable or disable HRD (국비환급과정) related features across all roles')
ON CONFLICT (key) DO NOTHING;