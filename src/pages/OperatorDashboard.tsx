import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Building2, Users, DollarSign, Activity, TrendingUp, AlertCircle, Server, ArrowUp, ArrowDown } from "lucide-react";
import atomLogo from "@/assets/atom-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";

const OperatorDashboard = ({ isDemo = false }: { isDemo?: boolean }) => {
  const navigate = useNavigate();
  const { role, isOperator, loading } = useUserRole();
  const [stats, setStats] = useState({
    totalTenants: 0,
    activeTenants: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
  });
  const { toast } = useToast();

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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
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
        <div className="mb-8 flex items-center gap-4">
          <img src={atomLogo} alt="Operator" className="h-20 w-20" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">운영자 대시보드</h1>
            <p className="text-slate-400">SaaS 플랫폼 전체를 관리하고 모니터링하세요</p>
          </div>
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
          />
          <OperatorStatsCard
            title="전체 사용자"
            value={isDemo ? "3,847" : stats.totalUsers.toLocaleString()}
            icon={<Users className="h-5 w-5" />}
            description="지난달 대비"
            trend="up"
            trendValue="+280"
          />
          <OperatorStatsCard
            title="월 구독 수익"
            value={isDemo ? "₩3.45M" : `₩${(stats.monthlyRevenue / 1000000).toFixed(2)}M`}
            icon={<DollarSign className="h-5 w-5" />}
            description="지난달 대비"
            trend="up"
            trendValue="+18%"
          />
          <OperatorStatsCard
            title="시스템 상태"
            value="정상"
            icon={<Server className="h-5 w-5" />}
            description="모든 서비스 운영 중"
            status="healthy"
          />
        </div>

        {/* Platform Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base text-white">고객사 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <OperatorStatRow label="스타터" value="5" percentage={42} color="violet" />
                <OperatorStatRow label="스탠다드" value="4" percentage={33} color="purple" />
                <OperatorStatRow label="프로페셔널" value="3" percentage={25} color="fuchsia" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base text-white">리소스 사용량</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">총 스토리지</span>
                  <span className="font-medium text-white">245 GB / 500 GB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">AI 토큰 (월)</span>
                  <span className="font-medium text-white">1.2M / 5M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">대역폭</span>
                  <span className="font-medium text-white">4.8 TB</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base text-white">수익 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">평균 ARPU</span>
                  <span className="font-medium text-white">₩287,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">이탈율</span>
                  <span className="font-medium text-white">2.1%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">성장률 (MoM)</span>
                  <span className="font-medium text-green-400">+18%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Alerts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">최근 활동</CardTitle>
              <CardDescription className="text-slate-400">플랫폼의 최근 주요 활동</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ActivityLog
                  type="tenant"
                  message="새 고객사 등록: ABC 대학교"
                  time="10분 전"
                />
                <ActivityLog
                  type="payment"
                  message="구독 갱신: XYZ 학원 (프로페셔널)"
                  time="25분 전"
                />
                <ActivityLog
                  type="system"
                  message="시스템 업데이트 완료"
                  time="1시간 전"
                />
                <ActivityLog
                  type="tenant"
                  message="고객사 플랜 업그레이드: 123 교육원"
                  time="2시간 전"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <AlertCircle className="h-5 w-5 text-orange-400" />
                알림 및 경고
              </CardTitle>
              <CardDescription className="text-slate-400">주의가 필요한 항목</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AlertItem
                  level="warning"
                  title="리소스 한계 도달"
                  description="2개 고객사가 사용량 80% 초과"
                  action="확인"
                />
                <AlertItem
                  level="info"
                  title="결제 만료 예정"
                  description="3개 고객사 구독 갱신 7일 전"
                  action="통보"
                />
                <AlertItem
                  level="warning"
                  title="서버 사용률 증가"
                  description="지난 주 대비 45% 증가"
                  action="모니터링"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">빠른 작업</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-violet-500"
                onClick={() => window.location.href = '/admin/tenants'}
              >
                <Building2 className="h-5 w-5" />
                고객사 추가
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-violet-500"
                onClick={() => window.location.href = '/admin/usage'}
              >
                <Activity className="h-5 w-5" />
                사용량 확인
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-violet-500"
                onClick={() => window.location.href = '/admin/revenue'}
              >
                <DollarSign className="h-5 w-5" />
                매출 분석
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-violet-500"
                onClick={() => window.location.href = '/admin/monitoring'}
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
  status
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  description: string; 
  trend?: "up" | "down";
  trendValue?: string;
  status?: "healthy" | "warning" | "error";
}) => (
  <Card className="overflow-hidden bg-slate-900/50 border-slate-800 backdrop-blur-xl hover:border-violet-500/50 transition-all duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
      <div className="text-violet-400 flex-shrink-0 p-2 rounded-lg bg-violet-500/10">{icon}</div>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-3xl font-bold text-white">{value}</div>
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
        <span className="text-slate-500">{description}</span>
      </div>
    </CardContent>
  </Card>
);

const OperatorStatRow = ({ 
  label, 
  value, 
  percentage,
  color = "violet"
}: { 
  label: string; 
  value: string; 
  percentage: number;
  color?: "violet" | "purple" | "fuchsia";
}) => {
  const colorClasses = {
    violet: "bg-violet-500",
    purple: "bg-purple-500", 
    fuchsia: "bg-fuchsia-500",
  };
  
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-sm font-medium text-white">{value}</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2">
        <div 
          className={`${colorClasses[color]} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const ActivityLog = ({ type, message, time }: { type: string; message: string; time: string }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
    <div className="h-8 w-8 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0">
      <div className="h-2 w-2 rounded-full bg-violet-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-white">{message}</p>
      <p className="text-xs text-slate-500">{time}</p>
    </div>
  </div>
);

const AlertItem = ({ 
  level, 
  title, 
  description, 
  action 
}: { 
  level: "info" | "warning"; 
  title: string; 
  description: string; 
  action: string;
}) => (
  <div className="flex flex-col sm:flex-row items-start justify-between gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-medium text-white mb-1">{title}</h4>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
    <Button 
      size="sm" 
      variant={level === "warning" ? "destructive" : "outline"} 
      className={cn(
        "w-full sm:w-auto flex-shrink-0",
        level === "info" && "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
      )}
    >
      {action}
    </Button>
  </div>
);

export default OperatorDashboard;
