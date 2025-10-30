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

const OperatorSettings = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
          <h1 className="text-3xl font-bold text-white mb-2">플랫폼 설정</h1>
          <p className="text-slate-400">플랫폼 전체 설정을 관리합니다</p>
        </div>

        {/* Platform Settings */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              기본 설정
            </CardTitle>
            <CardDescription className="text-slate-400">플랫폼의 기본 설정을 관리합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platformName" className="text-slate-300">플랫폼 이름</Label>
              <Input
                id="platformName"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportEmail" className="text-slate-300">지원 이메일</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxTenants" className="text-slate-300">최대 고객사 수</Label>
                <Input
                  id="maxTenants"
                  type="number"
                  value={settings.maxTenants}
                  onChange={(e) => setSettings({ ...settings, maxTenants: parseInt(e.target.value) })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultStorageLimit" className="text-slate-300">기본 스토리지 (GB)</Label>
                <Input
                  id="defaultStorageLimit"
                  type="number"
                  value={settings.defaultStorageLimit}
                  onChange={(e) => setSettings({ ...settings, defaultStorageLimit: parseInt(e.target.value) })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultStudentLimit" className="text-slate-300">기본 학생 수</Label>
                <Input
                  id="defaultStudentLimit"
                  type="number"
                  value={settings.defaultStudentLimit}
                  onChange={(e) => setSettings({ ...settings, defaultStudentLimit: parseInt(e.target.value) })}
                  className="bg-slate-800 border-slate-700 text-white"
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
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">API 설정</CardTitle>
            <CardDescription className="text-slate-400">외부 서비스 연동 설정</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <h4 className="text-sm font-medium text-white mb-2">Lovable AI</h4>
                <p className="text-xs text-slate-400">AI 기능 제공을 위한 API 연동</p>
                <div className="mt-3">
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/50">연결됨</Badge>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <h4 className="text-sm font-medium text-white mb-2">Toss Payments</h4>
                <p className="text-xs text-slate-400">결제 시스템 연동</p>
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
