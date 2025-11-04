import { useState, useEffect } from "react";
import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save, Globe, GraduationCap, Users, BookOpen, Bell, Shield, Layout } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

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

  const [hrdEnabled, setHrdEnabled] = useState(() => {
    const saved = localStorage.getItem("hrd_enabled");
    return saved !== "false";
  });

  const [settings, setSettings] = useState({
    platformName: "atomLMS",
    supportEmail: "support@atomlms.com",
    adminEmail: "admin@atomlms.com",
    maxTenants: 100,
    defaultStorageLimit: 10,
    defaultStudentLimit: 50,
    minCoursePrice: 10000,
    commissionRate: 15,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    allowSignup: true,
    emailVerification: true,
    instructorApproval: true,
    courseApproval: true,
    autoRefund: true,
    newUserAlert: true,
    courseSubmitAlert: true,
    paymentAlert: true,
    twoFactor: false,
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

  const handleMainPageToggle = async (version: "main" | "main2") => {
    setLoadingMainPage(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("system_settings")
        .update({
          setting_value: version,
          updated_by: user.id,
        })
        .eq("setting_key", "main_page_version");

      if (error) throw error;

      setMainPageVersion(version);
      toast({
        title: "설정 변경 완료",
        description: `메인 페이지가 ${version === "main" ? "기본 메인" : "데모 메인"}으로 변경되었습니다.`,
      });

      // Reload to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error("Error updating main page version:", error);
      toast({
        title: "설정 변경 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingMainPage(false);
    }
  };

  const handleHrdToggle = (checked: boolean) => {
    setHrdEnabled(checked);
    localStorage.setItem("hrd_enabled", String(checked));
    
    // Dispatch custom event to update menus immediately
    window.dispatchEvent(new CustomEvent('hrd-toggle', { detail: { enabled: checked } }));
    
    toast({
      title: checked ? "HRD 기능 활성화" : "HRD 기능 비활성화",
      description: checked 
        ? "모든 역할에서 HRD 관련 메뉴가 표시됩니다." 
        : "모든 역할에서 HRD 관련 메뉴가 숨겨집니다.",
    });

    // Reload page to ensure all components update
    setTimeout(() => {
      window.location.reload();
    }, 1000);
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
          "transition-colors border-border/50 shadow-sm bg-gradient-to-br",
          theme === "dark" ? "from-accent/5 to-accent/10 bg-slate-900/50 border-slate-800" : "from-accent/5 to-accent/10 bg-slate-100/50 border-slate-300"
        )}>
          <CardHeader>
            <CardTitle className={cn(
              "flex items-center gap-2 transition-colors",
              theme === "dark" ? "text-white" : "text-slate-900"
            )}>
              <Layout className="h-5 w-5 text-accent" />
              메인 페이지 버전 선택
            </CardTitle>
            <CardDescription className={cn(
              "transition-colors",
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            )}>
              사이트 메인 페이지(/) 를 선택합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "space-y-4 p-4 rounded-lg border",
              theme === "dark" ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
            )}>
              <div className="space-y-2">
                <Label className="text-base font-semibold">현재 메인 페이지</Label>
                <p className={cn(
                  "text-sm",
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                )}>
                  • <strong>기본 메인 (Landing)</strong>: 서비스 소개 랜딩 페이지<br />
                  • <strong>데모 메인 (Main2)</strong>: 데모 신청 및 승인 페이지
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  variant={mainPageVersion === "main" ? "default" : "outline"}
                  onClick={() => handleMainPageToggle("main")}
                  disabled={loadingMainPage}
                  className="flex-1"
                >
                  기본 메인 (Landing)
                </Button>
                <Button
                  variant={mainPageVersion === "main2" ? "default" : "outline"}
                  onClick={() => handleMainPageToggle("main2")}
                  disabled={loadingMainPage}
                  className="flex-1"
                >
                  데모 메인 (Main2)
                </Button>
              </div>
              <p className={cn(
                "text-xs",
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              )}>
                현재 설정: <strong>{mainPageVersion === "main" ? "기본 메인 (Landing)" : "데모 메인 (Main2)"}</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* HRD 기능 설정 */}
        <Card className={cn(
          "transition-colors border-border/50 shadow-sm bg-gradient-to-br",
          theme === "dark" ? "from-primary/5 to-primary/10 bg-slate-900/50 border-slate-800" : "from-primary/5 to-primary/10 bg-slate-100/50 border-slate-300"
        )}>
          <CardHeader>
            <CardTitle className={cn(
              "flex items-center gap-2 transition-colors",
              theme === "dark" ? "text-white" : "text-slate-900"
            )}>
              <GraduationCap className="h-5 w-5 text-primary" />
              HRD 국비환급과정 기능
            </CardTitle>
            <CardDescription className={cn(
              "transition-colors",
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            )}>
              국비환급과정 관련 메뉴를 모든 역할에서 한 번에 숨기거나 표시합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "flex items-center justify-between p-4 rounded-lg border",
              theme === "dark" ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
            )}>
              <div className="space-y-1">
                <Label htmlFor="hrd-enabled" className="text-base font-semibold">
                  HRD 기능 활성화
                </Label>
                <p className={cn(
                  "text-sm",
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                )}>
                  비활성화 시 출석관리, 훈련일지, 만족도조사, 상담일지, 중도탈락관리, 수료관리, 성적관리, 훈련수당 등 HRD 관련 메뉴가 모두 숨겨집니다
                </p>
              </div>
              <Switch 
                id="hrd-enabled" 
                checked={hrdEnabled} 
                onCheckedChange={handleHrdToggle}
              />
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

            <div className="space-y-2">
              <Label htmlFor="adminEmail" className={cn(
                "transition-colors",
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              )}>관리자 이메일</Label>
              <Input
                id="adminEmail"
                type="email"
                value={settings.adminEmail}
                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
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

        {/* 사용자 설정 */}
        <Card className={cn(
          "transition-colors border-border/50 shadow-sm",
          theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
        )}>
          <CardHeader>
            <CardTitle className={cn(
              "flex items-center gap-2 transition-colors",
              theme === "dark" ? "text-white" : "text-slate-900"
            )}>
              <Users className="h-5 w-5" />
              사용자 설정
            </CardTitle>
            <CardDescription className={cn(
              "transition-colors",
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            )}>
              사용자 가입 및 권한 관련 설정을 관리합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allow-signup" className={cn(
                  "transition-colors",
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                )}>신규 가입 허용</Label>
                <p className={cn(
                  "text-sm",
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                )}>
                  새로운 사용자의 회원가입을 허용합니다
                </p>
              </div>
              <Switch 
                id="allow-signup" 
                checked={settings.allowSignup}
                onCheckedChange={(checked) => setSettings({ ...settings, allowSignup: checked })}
              />
            </div>
            <Separator className={cn(theme === "dark" ? "bg-slate-700" : "bg-slate-300")} />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-verification" className={cn(
                  "transition-colors",
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                )}>이메일 인증 필수</Label>
                <p className={cn(
                  "text-sm",
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                )}>
                  가입 시 이메일 인증을 필수로 요구합니다
                </p>
              </div>
              <Switch 
                id="email-verification" 
                checked={settings.emailVerification}
                onCheckedChange={(checked) => setSettings({ ...settings, emailVerification: checked })}
              />
            </div>
            <Separator className={cn(theme === "dark" ? "bg-slate-700" : "bg-slate-300")} />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="instructor-approval" className={cn(
                  "transition-colors",
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                )}>강사 승인 필요</Label>
                <p className={cn(
                  "text-sm",
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                )}>
                  강사 등록 시 관리자 승인이 필요합니다
                </p>
              </div>
              <Switch 
                id="instructor-approval" 
                checked={settings.instructorApproval}
                onCheckedChange={(checked) => setSettings({ ...settings, instructorApproval: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* 강의 설정 */}
        <Card className={cn(
          "transition-colors border-border/50 shadow-sm",
          theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
        )}>
          <CardHeader>
            <CardTitle className={cn(
              "flex items-center gap-2 transition-colors",
              theme === "dark" ? "text-white" : "text-slate-900"
            )}>
              <BookOpen className="h-5 w-5" />
              강의 설정
            </CardTitle>
            <CardDescription className={cn(
              "transition-colors",
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            )}>강의 관련 설정을 관리합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="course-approval" className={cn(
                  "transition-colors",
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                )}>강의 승인 필수</Label>
                <p className={cn(
                  "text-sm",
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                )}>
                  새로운 강의는 관리자 승인 후 공개됩니다
                </p>
              </div>
              <Switch 
                id="course-approval" 
                checked={settings.courseApproval}
                onCheckedChange={(checked) => setSettings({ ...settings, courseApproval: checked })}
              />
            </div>
            <Separator className={cn(theme === "dark" ? "bg-slate-700" : "bg-slate-300")} />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-refund" className={cn(
                  "transition-colors",
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                )}>자동 환불 허용</Label>
                <p className={cn(
                  "text-sm",
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                )}>
                  7일 이내 자동 환불을 허용합니다
                </p>
              </div>
              <Switch 
                id="auto-refund" 
                checked={settings.autoRefund}
                onCheckedChange={(checked) => setSettings({ ...settings, autoRefund: checked })}
              />
            </div>
            <Separator className={cn(theme === "dark" ? "bg-slate-700" : "bg-slate-300")} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-price" className={cn(
                  "transition-colors",
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                )}>최소 강의 가격</Label>
                <Input
                  id="min-price"
                  type="number"
                  value={settings.minCoursePrice}
                  onChange={(e) => setSettings({ ...settings, minCoursePrice: parseInt(e.target.value) })}
                  className={cn(
                    "transition-colors",
                    theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission-rate" className={cn(
                  "transition-colors",
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                )}>수수료율 (%)</Label>
                <Input
                  id="commission-rate"
                  type="number"
                  value={settings.commissionRate}
                  onChange={(e) => setSettings({ ...settings, commissionRate: parseInt(e.target.value) })}
                  className={cn(
                    "transition-colors",
                    theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 알림 설정 */}
        <Card className={cn(
          "transition-colors border-border/50 shadow-sm",
          theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
        )}>
          <CardHeader>
            <CardTitle className={cn(
              "flex items-center gap-2 transition-colors",
              theme === "dark" ? "text-white" : "text-slate-900"
            )}>
              <Bell className="h-5 w-5" />
              알림 설정
            </CardTitle>
            <CardDescription className={cn(
              "transition-colors",
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            )}>
              시스템 알림 및 이메일 설정을 관리합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-user-alert" className={cn(
                  "transition-colors",
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                )}>신규 가입 알림</Label>
                <p className={cn(
                  "text-sm",
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                )}>
                  새로운 사용자 가입 시 알림을 받습니다
                </p>
              </div>
              <Switch 
                id="new-user-alert" 
                checked={settings.newUserAlert}
                onCheckedChange={(checked) => setSettings({ ...settings, newUserAlert: checked })}
              />
            </div>
            <Separator className={cn(theme === "dark" ? "bg-slate-700" : "bg-slate-300")} />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="course-submit-alert" className={cn(
                  "transition-colors",
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                )}>강의 제출 알림</Label>
                <p className={cn(
                  "text-sm",
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                )}>
                  새로운 강의 제출 시 알림을 받습니다
                </p>
              </div>
              <Switch 
                id="course-submit-alert" 
                checked={settings.courseSubmitAlert}
                onCheckedChange={(checked) => setSettings({ ...settings, courseSubmitAlert: checked })}
              />
            </div>
            <Separator className={cn(theme === "dark" ? "bg-slate-700" : "bg-slate-300")} />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="payment-alert" className={cn(
                  "transition-colors",
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                )}>결제 알림</Label>
                <p className={cn(
                  "text-sm",
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                )}>
                  결제 발생 시 알림을 받습니다
                </p>
              </div>
              <Switch 
                id="payment-alert" 
                checked={settings.paymentAlert}
                onCheckedChange={(checked) => setSettings({ ...settings, paymentAlert: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* 보안 설정 */}
        <Card className={cn(
          "transition-colors border-border/50 shadow-sm",
          theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
        )}>
          <CardHeader>
            <CardTitle className={cn(
              "flex items-center gap-2 transition-colors",
              theme === "dark" ? "text-white" : "text-slate-900"
            )}>
              <Shield className="h-5 w-5" />
              보안 설정
            </CardTitle>
            <CardDescription className={cn(
              "transition-colors",
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            )}>플랫폼 보안 관련 설정입니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="two-factor" className={cn(
                  "transition-colors",
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                )}>2단계 인증 활성화</Label>
                <p className={cn(
                  "text-sm",
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                )}>
                  관리자 계정에 2단계 인증을 적용합니다
                </p>
              </div>
              <Switch 
                id="two-factor"
                checked={settings.twoFactor}
                onCheckedChange={(checked) => setSettings({ ...settings, twoFactor: checked })}
              />
            </div>
            <Separator className={cn(theme === "dark" ? "bg-slate-700" : "bg-slate-300")} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="session-timeout" className={cn(
                  "transition-colors",
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                )}>세션 타임아웃 (분)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                  className={cn(
                    "transition-colors",
                    theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-login-attempts" className={cn(
                  "transition-colors",
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                )}>최대 로그인 시도 횟수</Label>
                <Input
                  id="max-login-attempts"
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                  className={cn(
                    "transition-colors",
                    theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  )}
                />
              </div>
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

        {/* 저장 버튼 */}
        <div className="flex justify-end gap-4">
          <Button 
            variant="outline"
            className={cn(
              theme === "dark" ? "border-slate-700 hover:bg-slate-800" : "border-slate-300 hover:bg-slate-100"
            )}
          >
            취소
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="gap-2 bg-violet-500 hover:bg-violet-600"
          >
            <Save className="h-4 w-4" />
            {loading ? "저장 중..." : "변경사항 저장"}
          </Button>
        </div>
      </div>
    </OperatorLayout>
  );
};

export default OperatorSettings;
