import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Palette, Eye, Check, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Template {
  id: string;
  name: string;
  description: string;
  template_key: string;
  style_config: any;
  is_active: boolean;
  thumbnail_url?: string;
}

const AdminTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
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
        .order("display_order");

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "템플릿 불러오기 실패",
        description: "템플릿 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentTemplate = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Get user's tenant
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("tenant_id")
        .eq("user_id", userData.user.id)
        .eq("role", "admin")
        .single();

      if (!roleData?.tenant_id) return;

      const { data: settingsData } = await supabase
        .from("tenant_settings")
        .select("template_id")
        .eq("tenant_id", roleData.tenant_id)
        .maybeSingle();

      if (settingsData?.template_id) {
        setCurrentTemplateId(settingsData.template_id);
      }
    } catch (error) {
      console.error("Error fetching current template:", error);
    }
  };

  const handleSelectTemplate = async (template: Template) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("tenant_id")
        .eq("user_id", userData.user.id)
        .eq("role", "admin")
        .single();

      if (!roleData?.tenant_id) {
        toast({
          title: "권한 없음",
          description: "테넌트 정보를 찾을 수 없습니다.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("tenant_settings")
        .upsert({
          tenant_id: roleData.tenant_id,
          template_id: template.id,
        }, {
          onConflict: "tenant_id",
        });

      if (error) throw error;

      setCurrentTemplateId(template.id);
      toast({
        title: "템플릿 적용 완료",
        description: `${template.name} 템플릿이 적용되었습니다.`,
      });
    } catch (error) {
      console.error("Error selecting template:", error);
      toast({
        title: "템플릿 적용 실패",
        description: "템플릿 적용 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const getTemplatePreview = (templateKey: string) => {
    const previews: { [key: string]: string } = {
      "modern-professional": "모던하고 전문적인 그라데이션 디자인",
      "academic-classic": "클래식한 학술 스타일의 견고한 디자인",
      "creative-vibrant": "화려하고 창의적인 컬러풀 디자인",
      "minimal-clean": "깔끔한 미니멀리스트 디자인",
      "tech-innovation": "혁신적인 테크 스타일의 미래지향적 디자인",
    };
    return previews[templateKey] || "템플릿 미리보기";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">템플릿을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
            <Palette className="h-8 w-8 text-primary" />
            디자인 템플릿
          </h1>
          <p className="text-muted-foreground mt-2">
            학습 플랫폼의 디자인 템플릿을 선택하고 관리하세요
          </p>
        </div>
        <Badge variant="outline" className="gap-2">
          <Sparkles className="h-3 w-3" />
          {templates.length}개 템플릿
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`relative overflow-hidden transition-all hover:shadow-lg ${
              currentTemplateId === template.id ? "border-2 border-primary shadow-glow" : ""
            }`}
          >
            {currentTemplateId === template.id && (
              <div className="absolute top-4 right-4 z-10">
                <Badge className="gap-1 bg-primary">
                  <Check className="h-3 w-3" />
                  사용중
                </Badge>
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                {template.name}
              </CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Template Preview Box */}
              <div
                className="h-48 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/30"
                style={{
                  background: template.style_config.heroStyle === "gradient"
                    ? `linear-gradient(135deg, ${template.style_config.primaryColor}20, ${template.style_config.accentColor}20)`
                    : template.style_config.primaryColor + "10",
                }}
              >
                <div className="text-center">
                  <div
                    className="text-4xl font-bold mb-2"
                    style={{ color: template.style_config.primaryColor }}
                  >
                    Aa
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getTemplatePreview(template.template_key)}
                  </p>
                </div>
              </div>

              {/* Style Config Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">주 색상</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: template.style_config.primaryColor }}
                    />
                    <span className="font-mono text-xs">
                      {template.style_config.primaryColor}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">강조 색상</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: template.style_config.accentColor }}
                    />
                    <span className="font-mono text-xs">
                      {template.style_config.accentColor}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handlePreview(template)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  미리보기
                </Button>
                {currentTemplateId !== template.id && (
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    적용하기
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
            <DialogDescription>{selectedTemplate?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className="h-64 rounded-lg border flex items-center justify-center text-center p-8"
              style={{
                background: selectedTemplate?.style_config.heroStyle === "gradient"
                  ? `linear-gradient(135deg, ${selectedTemplate?.style_config.primaryColor}, ${selectedTemplate?.style_config.accentColor})`
                  : selectedTemplate?.style_config.primaryColor,
                color: "#ffffff",
              }}
            >
              <div>
                <h2 className="text-4xl font-bold mb-4">템플릿 미리보기</h2>
                <p className="text-lg opacity-90">
                  이 템플릿이 적용된 학습 플랫폼의 모습입니다
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">폰트 패밀리</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate?.style_config.fontFamily}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">히어로 스타일</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {selectedTemplate?.style_config.heroStyle}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTemplates;
