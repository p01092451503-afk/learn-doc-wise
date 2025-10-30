-- Create enum for user approval status
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- Add approval fields to profiles
ALTER TABLE public.profiles
ADD COLUMN approval_status approval_status NOT NULL DEFAULT 'approved',
ADD COLUMN approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN rejection_reason TEXT,
ADD COLUMN suspended_until TIMESTAMP WITH TIME ZONE;

-- Organizations table (그룹/조직)
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_members INTEGER,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User organizations junction table
CREATE TABLE public.user_organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

-- User activity logs (더 상세한 활동 로그)
CREATE TABLE public.user_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_description TEXT,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Everyone can view active organizations"
  ON public.organizations FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage organizations"
  ON public.organizations FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_organizations
CREATE POLICY "Users can view their organizations"
  ON public.user_organizations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage user organizations"
  ON public.user_organizations FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_activity_logs
CREATE POLICY "Users can view their own activity logs"
  ON public.user_activity_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all activity logs"
  ON public.user_activity_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert activity logs"
  ON public.user_activity_logs FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_profiles_approval_status ON public.profiles(approval_status);
CREATE INDEX idx_organizations_parent ON public.organizations(parent_id);
CREATE INDEX idx_user_organizations_user ON public.user_organizations(user_id);
CREATE INDEX idx_user_organizations_org ON public.user_organizations(organization_id);
CREATE INDEX idx_user_activity_logs_user ON public.user_activity_logs(user_id, created_at);
CREATE INDEX idx_user_activity_logs_type ON public.user_activity_logs(activity_type);

-- Create triggers
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_description TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.user_activity_logs (
    user_id,
    activity_type,
    activity_description,
    resource_type,
    resource_id,
    metadata
  ) VALUES (
    p_user_id,
    p_activity_type,
    p_description,
    p_resource_type,
    p_resource_id,
    p_metadata
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;