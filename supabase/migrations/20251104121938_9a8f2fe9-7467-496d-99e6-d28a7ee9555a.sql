-- Add demo_approved column to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    -- Create profiles table if it doesn't exist
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
      full_name TEXT,
      avatar_url TEXT,
      demo_approved BOOLEAN DEFAULT false,
      demo_requested_at TIMESTAMP WITH TIME ZONE,
      demo_approved_at TIMESTAMP WITH TIME ZONE,
      demo_approved_by UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- Policies
    CREATE POLICY "Users can view own profile"
      ON public.profiles FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can update own profile"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own profile"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Admins can view all profiles"
      ON public.profiles FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_roles.user_id = auth.uid()
          AND user_roles.role = 'admin'
        )
      );

    CREATE POLICY "Admins can update all profiles"
      ON public.profiles FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_roles.user_id = auth.uid()
          AND user_roles.role = 'admin'
        )
      );

    -- Trigger for updated_at
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  ELSE
    -- Add columns if table exists but columns don't
    ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS demo_approved BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS demo_requested_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS demo_approved_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS demo_approved_by UUID;
  END IF;
END $$;

-- Create system_settings table for main page version control
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Policies for system_settings
CREATE POLICY "Admins can manage system settings"
  ON public.system_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Everyone can view system settings"
  ON public.system_settings FOR SELECT
  USING (true);

-- Insert default main page version setting
INSERT INTO public.system_settings (setting_key, setting_value, description)
VALUES ('main_page_version', 'main', 'Current main page version: main or main2')
ON CONFLICT (setting_key) DO NOTHING;

-- Create trigger for system_settings updated_at
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON public.system_settings;
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();