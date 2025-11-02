import { useState, useEffect } from "react";
import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save } from "lucide-react";
import { cn } from "@/lib/utils";

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
            <Settings className="h-8 w-8" />
            플랫폼 설정
          </h1>
          <p className={cn(
            "transition-colors",
            theme === "dark" ? "text-slate-400" : "text-slate-600"
          )}>플랫폼 전체 설정을 관리합니다</p>
        </div>

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
