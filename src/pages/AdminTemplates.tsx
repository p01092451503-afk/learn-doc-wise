import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Eye, Check, Palette } from "lucide-react";
import { Link } from "react-router-dom";

interface Template {
  id: string;
  name: string;
  description: string;
  template_key: string;
  style_config: {
    primaryColor: string;
    accentColor: string;
    fontFamily: string;
    heroStyle: string;
  };
  thumbnail_url: string | null;
  is_active: boolean;
  display_order: number;
}

const AdminTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
    fetchCurrentTemplate();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      
      const templatesData = (data || []).map(item => ({
        ...item,
        style_config: item.style_config as Template['style_config']
      }));
      
      setTemplates(templatesData);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "템플릿 로드 실패",
        description: "템플릿을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentTemplate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("tenant_settings")
        .select("template_id")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (data) {
        setCurrentTemplate(data.template_id);
      }
    } catch (error) {
      console.error("Error fetching current template:", error);
    }
  };

  const handleSelectTemplate = async (templateId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get user's tenant_id
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("tenant_id")
        .eq("user_id", user.id)
        .single();

      if (!roleData?.tenant_id) throw new Error("Tenant ID not found");

      // Upsert tenant settings
      const { error } = await supabase
        .from("tenant_settings")
        .upsert({
          tenant_id: roleData.tenant_id,
          template_id: templateId,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "tenant_id"
        });

      if (error) throw error;

      setCurrentTemplate(templateId);
      toast({
        title: "템플릿 적용 완료",
        description: "선택한 템플릿이 성공적으로 적용되었습니다.",
      });
    } catch (error) {
      console.error("Error selecting template:", error);
      toast({
        title: "템플릿 적용 실패",
        description: "템플릿을 적용하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">디자인 템플릿</h1>
        <p className="text-muted-foreground">
          사용자에게 보여질 메인 페이지 디자인을 선택하세요
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const isSelected = currentTemplate === template.id;
          
          return (
            <Card 
              key={template.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary shadow-glow' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {template.name}
                      {isSelected && (
                        <Badge variant="default" className="gap-1">
                          <Check className="h-3 w-3" />
                          현재 사용중
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {template.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Color Preview */}
                <div className="flex items-center gap-3">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <div className="flex gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg border shadow-sm"
                      style={{ backgroundColor: template.style_config.primaryColor }}
                      title="Primary Color"
                    />
                    <div 
                      className="w-8 h-8 rounded-lg border shadow-sm"
                      style={{ backgroundColor: template.style_config.accentColor }}
                      title="Accent Color"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {template.style_config.fontFamily}
                  </span>
                </div>

                {/* Style Info */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{template.style_config.heroStyle}</Badge>
                  <Badge variant="outline">{template.template_key}</Badge>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link to={`/template-preview/${template.template_key}`} target="_blank" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Eye className="h-4 w-4" />
                      미리보기
                    </Button>
                  </Link>
                  <Button
                    variant={isSelected ? "default" : "premium"}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSelectTemplate(template.id)}
                    disabled={isSelected}
                  >
                    {isSelected ? "선택됨" : "선택하기"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Palette className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              사용 가능한 템플릿이 없습니다.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminTemplates;