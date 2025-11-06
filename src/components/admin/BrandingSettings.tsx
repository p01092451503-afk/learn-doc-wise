import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, Palette } from "lucide-react";

interface BrandingSettingsProps {
  tenantId: string;
}

export const BrandingSettings = ({ tenantId }: BrandingSettingsProps) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    logo_url: "",
    primary_color: "#4CAF50",
    secondary_color: "#2196F3",
    accent_color: "#FF9800",
    font_family: "Inter, sans-serif",
    welcome_message: "",
  });

  useEffect(() => {
    loadSettings();
  }, [tenantId]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select("metadata")
        .eq("id", tenantId)
        .single();

      if (error) throw error;

      if (data?.metadata && typeof data.metadata === 'object') {
        const metadata = data.metadata as any;
        if (metadata.branding) {
          setSettings(prev => ({ ...prev, ...metadata.branding }));
        }
      }
    } catch (error: any) {
      console.error("Error loading settings:", error);
      toast.error("설정을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: tenant, error: fetchError } = await supabase
        .from("tenants")
        .select("metadata")
        .eq("id", tenantId)
        .single();

      if (fetchError) throw fetchError;

      const currentMetadata = (tenant?.metadata && typeof tenant.metadata === 'object') 
        ? tenant.metadata as any 
        : {};
      
      const updatedMetadata = {
        ...currentMetadata,
        branding: settings,
      };

      const { error } = await supabase
        .from("tenants")
        .update({ metadata: updatedMetadata })
        .eq("id", tenantId);

      if (error) throw error;

      toast.success("브랜딩 설정이 저장되었습니다");
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error("설정 저장에 실패했습니다");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${tenantId}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setSettings(prev => ({ ...prev, logo_url: data.publicUrl }));
      toast.success("로고가 업로드되었습니다");
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast.error("로고 업로드에 실패했습니다");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          브랜딩 설정
        </CardTitle>
        <CardDescription>
          테넌트의 브랜드 이미지를 설정합니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="logo">로고 이미지</Label>
          {settings.logo_url && (
            <div className="mb-4">
              <img 
                src={settings.logo_url} 
                alt="Logo" 
                className="h-20 object-contain"
              />
            </div>
          )}
          <div className="flex items-center gap-4">
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="flex-1"
            />
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              업로드
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primary_color">주 색상</Label>
            <div className="flex gap-2">
              <Input
                id="primary_color"
                type="color"
                value={settings.primary_color}
                onChange={(e) => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={settings.primary_color}
                onChange={(e) => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary_color">보조 색상</Label>
            <div className="flex gap-2">
              <Input
                id="secondary_color"
                type="color"
                value={settings.secondary_color}
                onChange={(e) => setSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={settings.secondary_color}
                onChange={(e) => setSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accent_color">강조 색상</Label>
            <div className="flex gap-2">
              <Input
                id="accent_color"
                type="color"
                value={settings.accent_color}
                onChange={(e) => setSettings(prev => ({ ...prev, accent_color: e.target.value }))}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={settings.accent_color}
                onChange={(e) => setSettings(prev => ({ ...prev, accent_color: e.target.value }))}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="font_family">폰트 패밀리</Label>
          <Input
            id="font_family"
            value={settings.font_family}
            onChange={(e) => setSettings(prev => ({ ...prev, font_family: e.target.value }))}
            placeholder="Inter, sans-serif"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="welcome_message">환영 메시지</Label>
          <Textarea
            id="welcome_message"
            value={settings.welcome_message}
            onChange={(e) => setSettings(prev => ({ ...prev, welcome_message: e.target.value }))}
            placeholder="사용자가 로그인할 때 표시될 환영 메시지를 입력하세요"
            rows={4}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            저장
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
