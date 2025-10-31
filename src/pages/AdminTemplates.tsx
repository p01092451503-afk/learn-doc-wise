import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Eye, Check, Palette, Layout, Paintbrush } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import logoIcon from "@/assets/logo-icon.png";

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
      if (!user) {
        throw new Error("사용자 인증이 필요합니다.");
      }

      // Get user's tenant_id using the database function
      const { data: tenantData, error: tenantError } = await supabase
        .rpc('get_user_tenant_id', { _user_id: user.id });

      if (tenantError) {
        console.error("Tenant ID fetch error:", tenantError);
        throw new Error("테넌트 정보를 찾을 수 없습니다. 관리자 권한이 필요합니다.");
      }

      if (!tenantData) {
        throw new Error("테넌트 ID가 설정되어 있지 않습니다. 시스템 관리자에게 문의하세요.");
      }

      // Upsert tenant settings
      const { error: upsertError } = await supabase
        .from("tenant_settings")
        .upsert({
          tenant_id: tenantData,
          template_id: templateId,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "tenant_id"
        });

      if (upsertError) {
        console.error("Template upsert error:", upsertError);
        throw new Error(`템플릿 적용 중 오류: ${upsertError.message}`);
      }

      setCurrentTemplate(templateId);
      toast({
        title: "템플릿 적용 완료",
        description: "선택한 템플릿이 성공적으로 적용되었습니다.",
      });
    } catch (error: any) {
      console.error("Error selecting template:", error);
      toast({
        title: "템플릿 적용 실패",
        description: error.message || "템플릿을 적용하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const getLayoutBadge = (templateKey: string) => {
    switch (templateKey) {
      case "modern":
        return { 
          label: "풀스크린 레이아웃", 
          variant: "default" as const, 
          icon: Layout,
          description: "몰입형 전체화면 히어로 + 가로 스크롤 강좌 목록"
        };
      case "minimal":
        return { 
          label: "사이드바 레이아웃", 
          variant: "secondary" as const, 
          icon: Layout,
          description: "고정 사이드 네비게이션 + 2단 콘텐츠 구조"
        };
      case "card":
        return { 
          label: "매거진 레이아웃", 
          variant: "outline" as const, 
          icon: Layout,
          description: "비대칭 그리드 + 다양한 카드 크기 (Pinterest 스타일)"
        };
      default:
        return { 
          label: "기본 레이아웃", 
          variant: "outline" as const, 
          icon: Layout,
          description: "표준 레이아웃"
        };
    }
  };

  const getColorThemeBadge = (primaryColor: string) => {
    const hue = primaryColor.toLowerCase();
    if (hue.includes("blue") || hue.includes("#3b82f6")) {
      return { label: "블루 테마", variant: "default" as const };
    } else if (hue.includes("purple") || hue.includes("#9333ea")) {
      return { label: "퍼플 테마", variant: "secondary" as const };
    } else if (hue.includes("green") || hue.includes("#10b981")) {
      return { label: "그린 테마", variant: "outline" as const };
    }
    return { label: "커스텀 테마", variant: "outline" as const };
  };

  if (loading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header - 다른 관리자 페이지와 동일한 스타일 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">
              <img src={logoIcon} alt="atom" className="h-8 w-8" />
              디자인 템플릿
            </h1>
            <p className="text-muted-foreground mt-2">
              사용자에게 보여질 메인 페이지 디자인을 선택하세요. 각 템플릿은 고유한 색상 테마와 레이아웃 구조를 제공합니다.
            </p>
          </div>
        </div>

        {/* Templates Grid */}
        {templates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Palette className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                사용 가능한 템플릿이 없습니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => {
              const isSelected = currentTemplate === template.id;
              const layoutBadge = getLayoutBadge(template.template_key);
              const colorThemeBadge = getColorThemeBadge(template.style_config.primaryColor);
              
              return (
                <Card 
                  key={template.id} 
                  className={`relative transition-all duration-300 hover:shadow-lg overflow-hidden group ${
                    isSelected ? 'ring-2 ring-primary shadow-glow' : ''
                  }`}
                >
                  {/* Selection Badge */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge variant="default" className="gap-1 shadow-md">
                        <Check className="h-3 w-3" />
                        현재 사용중
                      </Badge>
                    </div>
                  )}

                  {/* Template Preview Area */}
                  <div className="aspect-video bg-gradient-to-br from-primary/5 to-accent/5 relative overflow-hidden border-b">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Palette className="h-10 w-10 text-primary/40 mx-auto" />
                        <p className="text-xs font-medium text-muted-foreground">
                          템플릿 미리보기
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {template.name}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-sm leading-relaxed line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 pb-6">
                    {/* 템플릿 구분 뱃지 */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <Layout className="h-3 w-3" />
                        레이아웃 구조
                      </p>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={layoutBadge.variant} className="text-xs gap-1">
                            <layoutBadge.icon className="h-3 w-3" />
                            {layoutBadge.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {template.style_config.heroStyle}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {layoutBadge.description}
                        </p>
                      </div>
                    </div>

                    {/* 색상 테마 */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <Paintbrush className="h-3 w-3" />
                        색상 테마
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                          <div 
                            className="w-8 h-8 rounded-lg border-2 border-border shadow-sm transition-transform hover:scale-110"
                            style={{ backgroundColor: template.style_config.primaryColor }}
                            title="Primary Color"
                          />
                          <div 
                            className="w-8 h-8 rounded-lg border-2 border-border shadow-sm transition-transform hover:scale-110"
                            style={{ backgroundColor: template.style_config.accentColor }}
                            title="Accent Color"
                          />
                        </div>
                        <Badge variant={colorThemeBadge.variant} className="text-xs">
                          {colorThemeBadge.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        폰트: {template.style_config.fontFamily}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Link to={`/template-preview/${template.template_key}`} target="_blank" className="flex-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          미리보기
                        </Button>
                      </Link>
                      <Button
                        variant={isSelected ? "secondary" : "default"}
                        size="sm"
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
    </DashboardLayout>
  );
};

export default AdminTemplates;