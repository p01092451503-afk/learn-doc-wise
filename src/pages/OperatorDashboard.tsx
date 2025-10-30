import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Building2, Users, DollarSign, Activity, TrendingUp, AlertCircle, Server } from "lucide-react";
import atomLogo from "@/assets/atom-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const OperatorDashboard = ({ isDemo = false }: { isDemo?: boolean }) => {
  const [stats, setStats] = useState({
    totalTenants: 0,
    activeTenants: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (!isDemo) {
      fetchStats();
    }
  }, [isDemo]);

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
    <DashboardLayout userRole="operator" isDemo={isDemo}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">운영자 대시보드</h1>
          <p className="text-sm md:text-base text-muted-foreground flex items-center gap-2">
            <img src={atomLogo} alt="atom" className="h-5 w-5" />
            SaaS 플랫폼 전체를 관리하고 모니터링하세요
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="전체 고객사"
            value={isDemo ? "12" : stats.totalTenants.toString()}
            icon={<Building2 className="h-4 w-4" />}
            description={`활성: ${isDemo ? "10" : stats.activeTenants}개`}
            trend="up"
          />
          <StatsCard
            title="전체 사용자"
            value={isDemo ? "3,847" : stats.totalUsers.toLocaleString()}
            icon={<Users className="h-4 w-4" />}
            description="+280 from last month"
            trend="up"
          />
          <StatsCard
            title="월 구독 수익"
            value={isDemo ? "₩3,450,000" : `₩${stats.monthlyRevenue.toLocaleString()}`}
            icon={<DollarSign className="h-4 w-4" />}
            description="+18% from last month"
            trend="up"
          />
          <StatsCard
            title="시스템 상태"
            value="정상"
            icon={<Server className="h-4 w-4" />}
            description="모든 서비스 운영 중"
          />
        </div>

        {/* Platform Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">고객사 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <StatRow label="스타터" value="5" percentage={42} />
                <StatRow label="스탠다드" value="4" percentage={33} />
                <StatRow label="프로페셔널" value="3" percentage={25} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">리소스 사용량</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">총 스토리지</span>
                  <span className="font-medium">245 GB / 500 GB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">AI 토큰 (월)</span>
                  <span className="font-medium">1.2M / 5M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">대역폭</span>
                  <span className="font-medium">4.8 TB</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">수익 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">평균 ARPU</span>
                  <span className="font-medium">₩287,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">이탈율</span>
                  <span className="font-medium">2.1%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">성장률 (MoM)</span>
                  <span className="font-medium text-green-600">+18%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Alerts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>최근 활동</CardTitle>
              <CardDescription>플랫폼의 최근 주요 활동</CardDescription>
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                알림 및 경고
              </CardTitle>
              <CardDescription>주의가 필요한 항목</CardDescription>
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
        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              <Button 
                variant="outline" 
                className="h-16 md:h-20 flex-col gap-1.5 md:gap-2 text-xs md:text-sm"
                onClick={() => window.location.href = '/admin/tenants'}
              >
                <Building2 className="h-4 w-4 md:h-5 md:w-5" />
                고객사 추가
              </Button>
              <Button 
                variant="outline" 
                className="h-16 md:h-20 flex-col gap-1.5 md:gap-2 text-xs md:text-sm"
                onClick={() => window.location.href = '/admin/usage'}
              >
                <Activity className="h-4 w-4 md:h-5 md:w-5" />
                사용량 확인
              </Button>
              <Button 
                variant="outline" 
                className="h-16 md:h-20 flex-col gap-1.5 md:gap-2 text-xs md:text-sm"
                onClick={() => window.location.href = '/admin/revenue'}
              >
                <DollarSign className="h-4 w-4 md:h-5 md:w-5" />
                매출 분석
              </Button>
              <Button 
                variant="outline" 
                className="h-16 md:h-20 flex-col gap-1.5 md:gap-2 text-xs md:text-sm"
                onClick={() => window.location.href = '/admin/monitoring'}
              >
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                시스템 상태
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  description, 
  trend 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  description: string; 
  trend?: "up" | "down";
}) => (
  <Card className="overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium whitespace-nowrap">{title}</CardTitle>
      <div className="text-muted-foreground flex-shrink-0">{icon}</div>
    </CardHeader>
    <CardContent className="space-y-1 min-w-0">
      <div className="text-2xl font-bold whitespace-nowrap overflow-x-auto scrollbar-hide">{value}</div>
      <p className={`text-xs whitespace-nowrap ${trend === "up" ? "text-green-600" : "text-muted-foreground"}`}>
        {description}
      </p>
    </CardContent>
  </Card>
);

const StatRow = ({ label, value, percentage }: { label: string; value: string; percentage: number }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
    <div className="w-full bg-muted rounded-full h-2">
      <div 
        className="bg-primary h-2 rounded-full transition-all duration-300" 
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
);

const ActivityLog = ({ type, message, time }: { type: string; message: string; time: string }) => (
  <div className="flex items-start gap-3">
    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
      <div className="h-2 w-2 rounded-full bg-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm">{message}</p>
      <p className="text-xs text-muted-foreground">{time}</p>
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
  <div className="flex flex-col sm:flex-row items-start justify-between gap-3 p-3 rounded-lg border">
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-medium mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <Button size="sm" variant={level === "warning" ? "destructive" : "outline"} className="w-full sm:w-auto flex-shrink-0">
      {action}
    </Button>
  </div>
);

export default OperatorDashboard;
