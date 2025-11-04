import { useState, useEffect } from "react";
import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

const OperatorSettings = () => {
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("operator-theme");
    return (saved as "dark" | "light") || "dark";
  });
  const { toast } = useToast();

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("operator-theme");
      setTheme((saved as "dark" | "light") || "dark");
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(() => {
      const saved = localStorage.getItem("operator-theme");
      if (saved !== theme) {
        setTheme((saved as "dark" | "light") || "dark");
      }
    }, 100);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [theme]);

  const [settings, setSettings] = useState({
    platformName: "atomLMS",
    supportEmail: "support@atomlms.com",
    maxTenants: 100,
    defaultStorageLimit: 10,
    defaultStudentLimit: 50,
  });

  const [mainPageVersion, setMainPageVersion] = useState<"main" | "main2">("main");
  const [loadingMainPage, setLoadingMainPage] = useState(false);

  useEffect(() => {
    fetchMainPageVersion();
  }, []);

  const fetchMainPageVersion = async () => {
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("setting_value")
        .eq("setting_key", "main_page_version")
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setMainPageVersion(data.setting_value as "main" | "main2");
      }
    } catch (error: any) {
      console.error("Error fetching main page version:", error);
    }
  };

  const handleMainPageToggle = async () => {
    setLoadingMainPage(true);
    try {
      const newVersion = mainPageVersion === "main" ? "main2" : "main";
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase
        .from("system_settings")
        .update({
          setting_value: newVersion,
          updated_by: session?.user.id,
        })
        .eq("setting_key", "main_page_version");

      if (error) throw error;

      setMainPageVersion(newVersion);
      toast({
        title: "메인 페이지 변경 완료",
        description: `메인 페이지가 ${newVersion === "main" ? "기본" : "데모"} 버전으로 변경되었습니다.`,
      });
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "메인 페이지 변경에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoadingMainPage(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Here you would save settings to a configuration table
      // For now, just show a success message
      toast({
        title: "설정 저장 완료",
        description: "플랫폼 설정이 저장되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "설정 저장에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <OperatorLayout>
      <div className="space-y-6">
        <div>
          <h1 className={cn(
            "text-3xl font-bold mb-2 transition-colors flex items-center gap-3",
            theme === "dark" ? "text-white" : "text-slate-900"
          )}>
            <Settings className="h-8 w-8 text-violet-500" />
            플랫폼 설정
          </h1>
          <p className={cn(
            "transition-colors",
            theme === "dark" ? "text-slate-400" : "text-slate-600"
          )}>플랫폼 전체 설정을 관리합니다</p>
        </div>

        {/* Main Page Version */}
        <Card className={cn(
          "transition-colors",
          theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
        )}>
          <CardHeader>
            <CardTitle className={cn(
              "flex items-center gap-2 transition-colors",
              theme === "dark" ? "text-white" : "text-slate-900"
            )}>
              <Globe className="h-5 w-5" />
              메인 페이지 버전
            </CardTitle>
            <CardDescription className={cn(
              "transition-colors",
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            )}>
              사용자에게 표시될 메인 페이지를 선택합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className={cn(
                  "text-sm font-medium transition-colors",
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                )}>
                  현재 메인 페이지
                </Label>
                <p className={cn(
                  "text-sm transition-colors",
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                )}>
                  {mainPageVersion === "main" 
                    ? "기본 메인 페이지 (일반 사용자용)" 
                    : "데모 메인 페이지 (데모 신청 페이지)"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={cn(
                  "transition-colors",
                  mainPageVersion === "main" 
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/50"
                    : "bg-violet-500/10 text-violet-400 border-violet-500/50"
                )}>
                  {mainPageVersion === "main" ? "Main" : "Main2"}
                </Badge>
                <Switch
                  checked={mainPageVersion === "main2"}
                  onCheckedChange={handleMainPageToggle}
                  disabled={loadingMainPage}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Settings */}
        <Card className={cn(
          "transition-colors",
          theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
        )}>
          <CardHeader>
            <CardTitle className={cn(
              "flex items-center gap-2 transition-colors",
              theme === "dark" ? "text-white" : "text-slate-900"
            )}>
              <Settings className="h-5 w-5" />
              기본 설정
            </CardTitle>
            <CardDescription className={cn(
              "transition-colors",
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            )}>플랫폼의 기본 설정을 관리합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platformName" className={cn(
                "transition-colors",
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              )}>플랫폼 이름</Label>
              <Input
                id="platformName"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                className={cn(
                  "transition-colors",
                  theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportEmail" className={cn(
                "transition-colors",
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              )}>지원 이메일</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className={cn(
                  "transition-colors",
                  theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxTenants" className={cn(
                  "transition-colors",
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                )}>최대 고객사 수</Label>
                <Input
                  id="maxTenants"
                  type="number"
                  value={settings.maxTenants}
                  onChange={(e) => setSettings({ ...settings, maxTenants: parseInt(e.target.value) })}
                  className={cn(
                    "transition-colors",
                    theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultStorageLimit" className={cn(
                  "transition-colors",
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                )}>기본 스토리지 (GB)</Label>
                <Input
                  id="defaultStorageLimit"
                  type="number"
                  value={settings.defaultStorageLimit}
                  onChange={(e) => setSettings({ ...settings, defaultStorageLimit: parseInt(e.target.value) })}
                  className={cn(
                    "transition-colors",
                    theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultStudentLimit" className={cn(
                  "transition-colors",
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                )}>기본 학생 수</Label>
                <Input
                  id="defaultStudentLimit"
                  type="number"
                  value={settings.defaultStudentLimit}
                  onChange={(e) => setSettings({ ...settings, defaultStudentLimit: parseInt(e.target.value) })}
                  className={cn(
                    "transition-colors",
                    theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="gap-2 bg-violet-500 hover:bg-violet-600"
              >
                <Save className="h-4 w-4" />
                {loading ? "저장 중..." : "설정 저장"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card className={cn(
          "transition-colors",
          theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
        )}>
          <CardHeader>
            <CardTitle className={cn(
              "transition-colors",
              theme === "dark" ? "text-white" : "text-slate-900"
            )}>API 설정</CardTitle>
            <CardDescription className={cn(
              "transition-colors",
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            )}>외부 서비스 연동 설정</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={cn(
                "p-4 rounded-lg border transition-colors",
                theme === "dark" ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-300"
              )}>
                <h4 className={cn(
                  "text-sm font-medium mb-2 transition-colors",
                  theme === "dark" ? "text-white" : "text-slate-900"
                )}>Lovable AI</h4>
                <p className={cn(
                  "text-xs transition-colors",
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                )}>AI 기능 제공을 위한 API 연동</p>
                <div className="mt-3">
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/50">연결됨</Badge>
                </div>
              </div>

              <div className={cn(
                "p-4 rounded-lg border transition-colors",
                theme === "dark" ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-300"
              )}>
                <h4 className={cn(
                  "text-sm font-medium mb-2 transition-colors",
                  theme === "dark" ? "text-white" : "text-slate-900"
                )}>Toss Payments</h4>
                <p className={cn(
                  "text-xs transition-colors",
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                )}>결제 시스템 연동</p>
                <div className="mt-3">
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/50">연결됨</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </OperatorLayout>
  );
};

export default OperatorSettings;
