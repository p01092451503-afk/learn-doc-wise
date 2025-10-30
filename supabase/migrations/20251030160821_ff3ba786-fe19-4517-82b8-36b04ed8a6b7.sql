-- Create templates table for storing design templates
CREATE TABLE public.templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  preview_url TEXT,
  template_key TEXT NOT NULL UNIQUE,
  style_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tenant_settings table to store tenant's selected template
CREATE TABLE public.tenant_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.templates(id),
  custom_styles JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Enable RLS
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for templates
CREATE POLICY "Everyone can view active templates"
  ON public.templates
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage templates"
  ON public.templates
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for tenant_settings
CREATE POLICY "Admins can view their tenant settings"
  ON public.tenant_settings
  FOR SELECT
  USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can manage their tenant settings"
  ON public.tenant_settings
  FOR ALL
  USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Operators can view all tenant settings"
  ON public.tenant_settings
  FOR SELECT
  USING (is_operator(auth.uid()));

-- Insert default templates
INSERT INTO public.templates (name, description, template_key, style_config, display_order) VALUES
('Modern Professional', '깔끔하고 전문적인 디자인으로 기업 교육에 최적화된 템플릿', 'modern-professional', '{"primaryColor": "#8B5CF6", "accentColor": "#F59E0B", "fontFamily": "Inter", "heroStyle": "gradient"}', 1),
('Academic Classic', '전통적인 학술 스타일로 대학교 및 학원에 적합한 템플릿', 'academic-classic', '{"primaryColor": "#1E40AF", "accentColor": "#DC2626", "fontFamily": "Merriweather", "heroStyle": "solid"}', 2),
('Creative Vibrant', '활기차고 창의적인 디자인으로 예술/디자인 교육에 적합', 'creative-vibrant', '{"primaryColor": "#EC4899", "accentColor": "#14B8A6", "fontFamily": "Poppins", "heroStyle": "gradient"}', 3),
('Minimal Clean', '미니멀하고 깔끔한 디자인으로 모던한 느낌의 템플릿', 'minimal-clean', '{"primaryColor": "#0F172A", "accentColor": "#06B6D4", "fontFamily": "SF Pro", "heroStyle": "minimal"}', 4),
('Tech Innovation', '혁신적이고 기술적인 느낌의 IT/테크 교육 특화 템플릿', 'tech-innovation', '{"primaryColor": "#6366F1", "accentColor": "#10B981", "fontFamily": "Space Grotesk", "heroStyle": "gradient"}', 5);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tenant_settings_updated_at
  BEFORE UPDATE ON public.tenant_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();