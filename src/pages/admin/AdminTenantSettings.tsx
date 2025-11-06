import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { 
  Building2, 
  CreditCard, 
  TrendingUp, 
  Settings,
  Package,
  BarChart3,
  HardDrive,
  Users,
  Zap
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlanChangeDialog from "@/components/admin/PlanChangeDialog";
import BillingHistory from "@/components/admin/BillingHistory";
import TenantUsageStats from "@/components/admin/TenantUsageStats";
import { AtomLoader } from "@/components/AtomLoader";

interface TenantInfo {
  id: string;
  name: string;
  subdomain: string;
  plan: string;
  status: string;
  max_students: number;
  max_storage_gb: number;
  max_ai_tokens: number;
  current_students?: number;
  storage_used_gb?: number;
  ai_tokens_used?: number;
  contract_start_date?: string;
  contract_end_date?: string;
}

const AdminTenantSettings = () => {
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const { toast } = useToast();
  const { tenantId, user } = useUser();

  useEffect(() => {
    if (tenantId) {
      fetchTenantInfo();
    } else {
      setLoading(false);
    }
  }, [tenantId]);

  const fetchTenantInfo = async () => {
    try {
      setLoading(true);

      // Fetch tenant info
      const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", tenantId)
        .single();

      if (tenantError) throw tenantError;

      // Fetch current usage
      const { data: usage } = await supabase
        .from("usage_metrics")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setTenantInfo({
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        plan: tenant.plan || 'starter',
        status: tenant.status,
        max_students: tenant.max_students || 50,
        max_storage_gb: tenant.max_storage_gb || 10,
        max_ai_tokens: 10000, // Default value since field doesn't exist yet
        contract_start_date: tenant.contract_start_date,
        contract_end_date: tenant.contract_end_date,
        current_students: usage?.student_count || 0,
        storage_used_gb: usage?.storage_used_gb || 0,
        ai_tokens_used: usage?.ai_tokens_used || 0,
      });
    } catch (error: any) {
      console.error("Error fetching tenant info:", error);
      toast({
        title: "오류",
        description: "테넌트 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case "enterprise":
        return "default";
      case "professional":
        return "secondary";
      case "standard":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "trial":
        return "secondary";
      case "suspended":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("ko-KR");
  };

  if (loading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center min-h-screen">
          <AtomLoader />
        </div>
      </DashboardLayout>
    );
  }

  if (!tenantId || !tenantInfo) {
    return (
      <DashboardLayout userRole="admin">
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <div>
                <p className="text-lg font-semibold text-muted-foreground">
                  테넌트 정보를 찾을 수 없습니다
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {!tenantId 
                    ? "이 계정은 테넌트에 소속되어 있지 않습니다." 
                    : "테넌트 정보를 불러올 수 없습니다."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              테넌트 설정
            </h1>
            <p className="text-muted-foreground mt-1">
              플랜 관리, 사용량 모니터링, 청구 내역을 확인하세요
            </p>
          </div>
          <Button onClick={() => setShowPlanDialog(true)}>
            <Package className="h-4 w-4 mr-2" />
            플랜 변경
          </Button>
        </div>

        {/* Tenant Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">테넌트 이름</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tenantInfo.name}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {tenantInfo.subdomain}.lms.com
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">현재 플랜</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                <Badge variant={getPlanBadgeVariant(tenantInfo.plan)}>
                  {tenantInfo.plan}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                활성 상태
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">서비스 상태</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge variant={getStatusBadgeVariant(tenantInfo.status)}>
                  {tenantInfo.status === "active" ? "활성" : 
                   tenantInfo.status === "trial" ? "체험" : "중단됨"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(tenantInfo.contract_end_date)} 까지
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">학생 수</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tenantInfo.current_students || 0} / {tenantInfo.max_students}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                사용률 {Math.round(((tenantInfo.current_students || 0) / tenantInfo.max_students) * 100)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="usage" className="space-y-4">
          <TabsList>
            <TabsTrigger value="usage" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              사용량 통계
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              청구 내역
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              상세 정보
            </TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="space-y-4">
            <TenantUsageStats tenantId={tenantInfo.id} tenantInfo={tenantInfo} />
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <BillingHistory tenantId={tenantInfo.id} />
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>테넌트 상세 정보</CardTitle>
                <CardDescription>
                  계약 및 리소스 제한 정보
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      계약 시작일
                    </label>
                    <p className="text-lg font-semibold">
                      {formatDate(tenantInfo.contract_start_date)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      계약 종료일
                    </label>
                    <p className="text-lg font-semibold">
                      {formatDate(tenantInfo.contract_end_date)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <HardDrive className="h-4 w-4" />
                      최대 저장공간
                    </label>
                    <p className="text-lg font-semibold">
                      {tenantInfo.max_storage_gb} GB
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      AI 토큰 한도
                    </label>
                    <p className="text-lg font-semibold">
                      {tenantInfo.max_ai_tokens?.toLocaleString()} 토큰
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Plan Change Dialog */}
        <PlanChangeDialog
          open={showPlanDialog}
          onOpenChange={setShowPlanDialog}
          currentPlan={tenantInfo.plan}
          tenantId={tenantInfo.id}
          onPlanChanged={fetchTenantInfo}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminTenantSettings;
