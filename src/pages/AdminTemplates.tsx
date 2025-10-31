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
    <div className="min-h-screen bg-muted/30 py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Section with better spacing */}
        <div className="bg-background rounded-2xl p-8 shadow-sm border">
          <h1 className="text-4xl font-display font-bold text-foreground mb-3">디자인 템플릿</h1>
          <p className="text-lg text-muted-foreground">
            사용자에게 보여질 메인 페이지 디자인을 선택하세요. 각 템플릿은 고유한 레이아웃 구조를 가지고 있습니다.
          </p>
        </div>

        {/* Templates Grid with proper spacing */}
        {templates.length === 0 ? (
          <Card className="bg-background">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <Palette className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground text-center">
                사용 가능한 템플릿이 없습니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {templates.map((template) => {
              const isSelected = currentTemplate === template.id;
              
              return (
                <Card 
                  key={template.id} 
                  className={`relative bg-background transition-all duration-300 hover:shadow-xl overflow-hidden group ${
                    isSelected ? 'ring-2 ring-primary shadow-glow' : ''
                  }`}
                >
                  {/* Selection Badge */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge variant="default" className="gap-1 shadow-lg">
                        <Check className="h-3 w-3" />
                        현재 사용중
                      </Badge>
                    </div>
                  )}

                  {/* Template Preview Area - placeholder for actual preview */}
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Palette className="h-12 w-12 text-primary/60 mx-auto" />
                        <p className="text-sm font-medium text-muted-foreground">
                          {template.template_key} 레이아웃
                        </p>
                      </div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                  </div>
                  
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                      {template.name}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-5 pb-6">
                    {/* Color Scheme Preview */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        색상 조합
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                          <div 
                            className="w-10 h-10 rounded-xl border-2 border-border shadow-sm transition-transform hover:scale-110"
                            style={{ backgroundColor: template.style_config.primaryColor }}
                            title="Primary Color"
                          />
                          <div 
                            className="w-10 h-10 rounded-xl border-2 border-border shadow-sm transition-transform hover:scale-110"
                            style={{ backgroundColor: template.style_config.accentColor }}
                            title="Accent Color"
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <span className="text-xs font-medium text-muted-foreground">
                            {template.style_config.fontFamily}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Style Tags */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        스타일 특성
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {template.style_config.heroStyle}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.template_key}
                        </Badge>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Link to={`/template-preview/${template.template_key}`} target="_blank" className="flex-1">
                        <Button 
                          variant="outline" 
                          size="default" 
                          className="w-full gap-2 hover:bg-accent"
                        >
                          <Eye className="h-4 w-4" />
                          미리보기
                        </Button>
                      </Link>
                      <Button
                        variant={isSelected ? "secondary" : "default"}
                        size="default"
                        className="flex-1"
                        onClick={() => handleSelectTemplate(template.id)}
                        disabled={isSelected}
                      >
                        {isSelected ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            선택됨
                          </>
                        ) : (
                          "선택하기"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTemplates;