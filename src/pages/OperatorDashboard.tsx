import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Building2, Users, DollarSign, Activity, TrendingUp, AlertCircle, Server, ArrowUp, ArrowDown, FileText, LayoutDashboard } from "lucide-react";
import { AtomSpinner } from "@/components/AtomSpinner";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRoleOptimized } from "@/hooks/useUserRoleOptimized";
import { cn } from "@/lib/utils";

const OperatorDashboard = ({ isDemo = false }: { isDemo?: boolean }) => {
  const navigate = useNavigate();
  const { data: roleData, isLoading: loading } = useUserRoleOptimized();
  const { role, isOperator } = roleData || { role: null, isOperator: false };
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("operator-theme");
    return (saved as "dark" | "light") || "dark";
  });
  const [stats, setStats] = useState({
    totalTenants: 0,
    activeTenants: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
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

  useEffect(() => {
    // Check authentication and authorization
    if (!isDemo && !loading) {
      if (!isOperator) {
        toast({
          title: "접근 권한 없음",
          description: "운영자 권한이 필요합니다.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
      fetchStats();
    } else if (isDemo) {
      // Demo mode doesn't need auth check
    }
  }, [isDemo, loading, isOperator, navigate]);

  // Show loading state while checking auth
  if (!isDemo && loading) {
    return (
      <OperatorLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AtomSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-slate-400">로딩 중...</p>
          </div>
        </div>
      </OperatorLayout>
    );
  }

  const fetchStats = async () => {
    try {
      const [tenantsResult, usersResult] = await Promise.all([
        supabase.from("tenants").select("*", { count: "exact" }),
        supabase.from("user_roles").select("*", { count: "exact" }),
      ]);

      if (tenantsResult.error) throw tenantsResult.error;
      if (usersResult.error) throw usersResult.error;

      const activeTenants = tenantsResult.data?.filter(t => t.is_active).length || 0;
      const monthlyRevenue = tenantsResult.data?.reduce((sum, t) => {
        const amounts = { starter: 0, standard: 150000, professional: 300000 };
        return sum + (amounts[t.plan as keyof typeof amounts] || 0);
      }, 0) || 0;

      setStats({
        totalTenants: tenantsResult.count || 0,
        activeTenants,
        totalUsers: usersResult.count || 0,
        monthlyRevenue,
      });
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "통계 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <OperatorLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className={cn(
            "text-3xl md:text-4xl font-bold mb-2 transition-colors flex items-center gap-3",
            theme === "dark" ? "text-white" : "text-slate-900"
          )}>
            <LayoutDashboard className="h-8 w-8 md:h-10 md:w-10" />
            운영자 대시보드
          </h1>
          <p className={cn(
            "transition-colors",
            theme === "dark" ? "text-slate-400" : "text-slate-600"
          )}>SaaS 플랫폼 전체를 관리하고 모니터링하세요</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <OperatorStatsCard
            title="전체 고객사"
            value={isDemo ? "12" : stats.totalTenants.toString()}
            icon={<Building2 className="h-5 w-5" />}
            description={`활성: ${isDemo ? "10" : stats.activeTenants}개`}
            trend="up"
            trendValue="+2"
            theme={theme}
          />
          <OperatorStatsCard
            title="전체 사용자"
            value={isDemo ? "3,847" : stats.totalUsers.toLocaleString()}
            icon={<Users className="h-5 w-5" />}
            description="지난달 대비"
            trend="up"
            trendValue="+280"
            theme={theme}
          />
          <OperatorStatsCard
            title="월 구독 수익"
            value={isDemo ? "₩3.45M" : `₩${(stats.monthlyRevenue / 1000000).toFixed(2)}M`}
            icon={<DollarSign className="h-5 w-5" />}
            description="지난달 대비"
            trend="up"
            trendValue="+18%"
            theme={theme}
          />
          <OperatorStatsCard
            title="시스템 상태"
            value="정상"
            icon={<Server className="h-5 w-5" />}
            description="모든 서비스 운영 중"
            status="healthy"
            theme={theme}
          />
        </div>

        {/* Platform Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className={cn(
            "backdrop-blur-xl transition-colors",
            theme === "dark" 
              ? "bg-slate-900/50 border-slate-800" 
              : "bg-white border-slate-200"
          )}>
            <CardHeader>
              <CardTitle className={cn(
                "text-base transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>고객사 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <OperatorStatRow label="스타터" value="5" percentage={42} color="violet" theme={theme} />
                <OperatorStatRow label="스탠다드" value="4" percentage={33} color="purple" theme={theme} />
                <OperatorStatRow label="프로페셔널" value="3" percentage={25} color="fuchsia" theme={theme} />
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "backdrop-blur-xl transition-colors",
            theme === "dark" 
              ? "bg-slate-900/50 border-slate-800" 
              : "bg-white border-slate-200"
          )}>
            <CardHeader>
              <CardTitle className={cn(
                "text-base transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>리소스 사용량</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={cn(
                    "text-sm transition-colors",
                    theme === "dark" ? "text-slate-400" : "text-slate-600"
                  )}>총 스토리지</span>
                  <span className={cn(
                    "font-medium transition-colors",
                    theme === "dark" ? "text-white" : "text-slate-900"
                  )}>245 GB / 500 GB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={cn(
                    "text-sm transition-colors",
                    theme === "dark" ? "text-slate-400" : "text-slate-600"
                  )}>AI 토큰 (월)</span>
                  <span className={cn(
                    "font-medium transition-colors",
                    theme === "dark" ? "text-white" : "text-slate-900"
                  )}>1.2M / 5M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={cn(
                    "text-sm transition-colors",
                    theme === "dark" ? "text-slate-400" : "text-slate-600"
                  )}>대역폭</span>
                  <span className={cn(
                    "font-medium transition-colors",
                    theme === "dark" ? "text-white" : "text-slate-900"
                  )}>4.8 TB</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "backdrop-blur-xl transition-colors",
            theme === "dark" 
              ? "bg-slate-900/50 border-slate-800" 
              : "bg-white border-slate-200"
          )}>
            <CardHeader>
              <CardTitle className={cn(
                "text-base transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>수익 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={cn(
                    "text-sm transition-colors",
                    theme === "dark" ? "text-slate-400" : "text-slate-600"
                  )}>평균 ARPU</span>
                  <span className={cn(
                    "font-medium transition-colors",
                    theme === "dark" ? "text-white" : "text-slate-900"
                  )}>₩287,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={cn(
                    "text-sm transition-colors",
                    theme === "dark" ? "text-slate-400" : "text-slate-600"
                  )}>이탈율</span>
                  <span className={cn(
                    "font-medium transition-colors",
                    theme === "dark" ? "text-white" : "text-slate-900"
                  )}>2.1%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={cn(
                    "text-sm transition-colors",
                    theme === "dark" ? "text-slate-400" : "text-slate-600"
                  )}>성장률 (MoM)</span>
                  <span className="font-medium text-green-400">+18%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Alerts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className={cn(
            "backdrop-blur-xl transition-colors",
            theme === "dark" 
              ? "bg-slate-900/50 border-slate-800" 
              : "bg-white border-slate-200"
          )}>
            <CardHeader>
              <CardTitle className={cn(
                "transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>최근 활동</CardTitle>
              <CardDescription className={cn(
                "transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              )}>플랫폼의 최근 주요 활동</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ActivityLog
                  type="tenant"
                  message="새 고객사 등록: ABC 대학교"
                  time="10분 전"
                  theme={theme}
                />
                <ActivityLog
                  type="payment"
                  message="구독 갱신: XYZ 학원 (프로페셔널)"
                  time="25분 전"
                  theme={theme}
                />
                <ActivityLog
                  type="system"
                  message="시스템 업데이트 완료"
                  time="1시간 전"
                  theme={theme}
                />
                <ActivityLog
                  type="tenant"
                  message="고객사 플랜 업그레이드: 123 교육원"
                  time="2시간 전"
                  theme={theme}
                />
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "backdrop-blur-xl transition-colors",
            theme === "dark" 
              ? "bg-slate-900/50 border-slate-800" 
              : "bg-white border-slate-200"
          )}>
            <CardHeader>
              <CardTitle className={cn(
                "flex items-center gap-2 transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>
                <AlertCircle className="h-5 w-5 text-orange-400" />
                알림 및 경고
              </CardTitle>
              <CardDescription className={cn(
                "transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              )}>주의가 필요한 항목</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AlertItem
                  level="warning"
                  title="리소스 한계 도달"
                  description="2개 고객사가 사용량 80% 초과"
                  action="확인"
                  theme={theme}
                />
                <AlertItem
                  level="info"
                  title="결제 만료 예정"
                  description="3개 고객사 구독 갱신 7일 전"
                  action="통보"
                  theme={theme}
                />
                <AlertItem
                  level="warning"
                  title="서버 사용률 증가"
                  description="지난 주 대비 45% 증가"
                  action="모니터링"
                  theme={theme}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className={cn(
          "backdrop-blur-xl transition-colors",
          theme === "dark" 
            ? "bg-slate-900/50 border-slate-800" 
            : "bg-white border-slate-200"
        )}>
          <CardHeader>
            <CardTitle className={cn(
              "transition-colors",
              theme === "dark" ? "text-white" : "text-slate-900"
            )}>빠른 작업</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              <Button 
                variant="outline" 
                className={cn(
                  "h-20 flex-col gap-2 transition-colors hover:border-violet-500",
                  theme === "dark"
                    ? "bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                    : "bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                )}
                onClick={() => navigate('/operator/tenants')}
              >
                <FileText className="h-5 w-5" />
                고객사 추가
              </Button>
              <Button 
                variant="outline" 
                className={cn(
                  "h-20 flex-col gap-2 transition-colors hover:border-violet-500",
                  theme === "dark"
                    ? "bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                    : "bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                )}
                onClick={() => navigate('/operator/usage')}
              >
                <Activity className="h-5 w-5" />
                사용량 확인
              </Button>
              <Button 
                variant="outline" 
                className={cn(
                  "h-20 flex-col gap-2 transition-colors hover:border-violet-500",
                  theme === "dark"
                    ? "bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                    : "bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                )}
                onClick={() => navigate('/operator/revenue')}
              >
                <DollarSign className="h-5 w-5" />
                매출 분석
              </Button>
              <Button 
                variant="outline" 
                className={cn(
                  "h-20 flex-col gap-2 transition-colors hover:border-violet-500",
                  theme === "dark"
                    ? "bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                    : "bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                )}
                onClick={() => navigate('/operator/monitoring')}
              >
                <TrendingUp className="h-5 w-5" />
                시스템 상태
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </OperatorLayout>
  );
};

const OperatorStatsCard = ({ 
  title, 
  value, 
  icon, 
  description, 
  trend,
  trendValue,
  status,
  theme = "dark"
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  description: string; 
  trend?: "up" | "down";
  trendValue?: string;
  status?: "healthy" | "warning" | "error";
  theme?: "dark" | "light";
}) => (
  <Card className={cn(
    "overflow-hidden backdrop-blur-xl hover:border-violet-500/50 transition-all duration-300",
    theme === "dark" 
      ? "bg-slate-900/50 border-slate-800" 
      : "bg-white border-slate-200"
  )}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className={cn(
        "text-sm font-medium transition-colors",
        theme === "dark" ? "text-slate-400" : "text-slate-600"
      )}>{title}</CardTitle>
      <div className="text-violet-400 flex-shrink-0 p-2 rounded-lg bg-violet-500/10">{icon}</div>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className={cn(
        "text-3xl font-bold transition-colors",
        theme === "dark" ? "text-white" : "text-slate-900"
      )}>{value}</div>
      <div className="flex items-center gap-2 text-xs">
        {trend && (
          <span className={`flex items-center gap-1 font-medium ${
            trend === "up" ? "text-green-400" : "text-red-400"
          }`}>
            {trend === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {trendValue}
          </span>
        )}
        {status && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            status === "healthy" ? "bg-green-500/20 text-green-400" :
            status === "warning" ? "bg-yellow-500/20 text-yellow-400" :
            "bg-red-500/20 text-red-400"
          }`}>
            {status === "healthy" ? "정상" : status === "warning" ? "주의" : "오류"}
          </span>
        )}
        <span className={cn(
          "transition-colors",
          theme === "dark" ? "text-slate-500" : "text-slate-600"
        )}>{description}</span>
      </div>
    </CardContent>
  </Card>
);

const OperatorStatRow = ({ 
  label, 
  value, 
  percentage,
  color = "violet",
  theme = "dark"
}: { 
  label: string; 
  value: string; 
  percentage: number;
  color?: "violet" | "purple" | "fuchsia";
  theme?: "dark" | "light";
}) => {
  const colorClasses = {
    violet: "bg-violet-500",
    purple: "bg-purple-500", 
    fuchsia: "bg-fuchsia-500",
  };
  
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className={cn(
          "text-sm transition-colors",
          theme === "dark" ? "text-slate-400" : "text-slate-600"
        )}>{label}</span>
        <span className={cn(
          "text-sm font-medium transition-colors",
          theme === "dark" ? "text-white" : "text-slate-900"
        )}>{value}</span>
      </div>
      <div className={cn(
        "w-full rounded-full h-2 transition-colors",
        theme === "dark" ? "bg-slate-800" : "bg-slate-200"
      )}>
        <div 
          className={`${colorClasses[color]} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const ActivityLog = ({ type, message, time, theme = "dark" }: { type: string; message: string; time: string; theme?: "dark" | "light"; }) => (
  <div className={cn(
    "flex items-start gap-3 p-3 rounded-lg transition-colors",
    theme === "dark" ? "hover:bg-slate-800/50" : "hover:bg-slate-100"
  )}>
    <div className="h-8 w-8 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0">
      <div className="h-2 w-2 rounded-full bg-violet-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className={cn(
        "text-sm transition-colors",
        theme === "dark" ? "text-white" : "text-slate-900"
      )}>{message}</p>
      <p className={cn(
        "text-xs transition-colors",
        theme === "dark" ? "text-slate-500" : "text-slate-600"
      )}>{time}</p>
    </div>
  </div>
);

const AlertItem = ({ 
  level, 
  title, 
  description, 
  action,
  theme = "dark"
}: { 
  level: "info" | "warning"; 
  title: string; 
  description: string; 
  action: string;
  theme?: "dark" | "light";
}) => (
  <div className={cn(
    "flex flex-col sm:flex-row items-start justify-between gap-3 p-3 rounded-lg border transition-colors",
    theme === "dark"
      ? "border-slate-700 bg-slate-800/30 hover:bg-slate-800/50"
      : "border-slate-300 bg-slate-50 hover:bg-slate-100"
  )}>
    <div className="flex-1 min-w-0">
      <h4 className={cn(
        "text-sm font-medium mb-1 transition-colors",
        theme === "dark" ? "text-white" : "text-slate-900"
      )}>{title}</h4>
      <p className={cn(
        "text-xs transition-colors",
        theme === "dark" ? "text-slate-400" : "text-slate-600"
      )}>{description}</p>
    </div>
    <Button 
      size="sm" 
      variant={level === "warning" ? "destructive" : "outline"} 
      className={cn(
        "w-full sm:w-auto flex-shrink-0",
        level === "info" && theme === "dark" && "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white",
        level === "info" && theme === "light" && "border-slate-400 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      {action}
    </Button>
  </div>
);

export default OperatorDashboard;
