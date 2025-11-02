import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, AlertTriangle, TrendingUp, Users, HardDrive, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface UsageMetric {
  id: string;
  tenant_id: string;
  metric_date: string;
  student_count: number;
  storage_used_gb: number;
  bandwidth_gb: number;
  ai_tokens_used: number;
  created_at: string;
}

interface Tenant {
  id: string;
  name: string;
  plan: string;
  max_students: number;
  max_storage_gb: number;
  is_active: boolean;
}

interface TenantWithUsage extends Tenant {
  usage?: UsageMetric;
  studentUsagePercent: number;
  storageUsagePercent: number;
}

const PLAN_LIMITS = {
  starter: { maxStudents: 50, maxStorageGB: 10 },
  professional: { maxStudents: 200, maxStorageGB: 50 },
  enterprise: { maxStudents: 1000, maxStorageGB: 200 },
};

const AdminUsageManagement = () => {
  const [tenants, setTenants] = useState<TenantWithUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch tenants
      const { data: tenantsData, error: tenantsError } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });

      if (tenantsError) throw tenantsError;

      // Fetch latest usage metrics for each tenant
      const tenantsWithUsage = await Promise.all(
        (tenantsData || []).map(async (tenant) => {
          const { data: usage } = await supabase
            .from("usage_metrics")
            .select("*")
            .eq("tenant_id", tenant.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          const limits = PLAN_LIMITS[tenant.plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.starter;
          const maxStudents = tenant.max_students || limits.maxStudents;
          const maxStorage = tenant.max_storage_gb || limits.maxStorageGB;

          return {
            ...tenant,
            usage,
            studentUsagePercent: usage ? (usage.student_count / maxStudents) * 100 : 0,
            storageUsagePercent: usage ? (usage.storage_used_gb / maxStorage) * 100 : 0,
          };
        })
      );

      setTenants(tenantsWithUsage);
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCollectMetrics = async () => {
    try {
      setCollecting(true);
      
      const { data, error } = await supabase.functions.invoke("collect-usage-metrics");

      if (error) throw error;

      toast({
        title: "성공",
        description: "사용량 데이터가 수집되었습니다.",
      });

      // Refresh data
      await fetchData();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "사용량 수집에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setCollecting(false);
    }
  };

  const handleCheckLimits = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-usage-limits");

      if (error) throw error;

      const violations = data?.violations || [];

      toast({
        title: violations.length > 0 ? "제한 초과 발견" : "정상",
        description: violations.length > 0
          ? `${violations.length}개의 제한 초과가 발견되었습니다.`
          : "모든 테넌트가 제한 내에서 운영 중입니다.",
        variant: violations.length > 0 ? "destructive" : "default",
      });
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "제한 확인에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      starter: "secondary",
      professional: "default",
      enterprise: "outline",
    };
    return <Badge variant={variants[plan] || "default"}>{plan.toUpperCase()}</Badge>;
  };

  const getUsageBadge = (percent: number) => {
    if (percent >= 100) return <Badge variant="destructive">초과</Badge>;
    if (percent >= 80) return <Badge variant="default">주의</Badge>;
    return <Badge variant="outline">정상</Badge>;
  };

  // Calculate totals
  const totalStudents = tenants.reduce((sum, t) => sum + (t.usage?.student_count || 0), 0);
  const totalStorage = tenants.reduce((sum, t) => sum + (t.usage?.storage_used_gb || 0), 0);
  const totalAITokens = tenants.reduce((sum, t) => sum + (t.usage?.ai_tokens_used || 0), 0);

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <HardDrive className="h-7 w-7 text-primary" />
              사용량 관리
            </h1>
            <p className="text-muted-foreground mt-2">
              테넌트별 리소스 사용량 모니터링 및 자동 과금 관리
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCheckLimits} variant="outline">
              <AlertTriangle className="h-4 w-4 mr-2" />
              제한 확인
            </Button>
            <Button onClick={handleCollectMetrics} disabled={collecting}>
              <RefreshCw className={`h-4 w-4 mr-2 ${collecting ? "animate-spin" : ""}`} />
              사용량 수집
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 테넌트</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tenants.length}</div>
              <p className="text-xs text-muted-foreground">
                활성: {tenants.filter(t => t.is_active).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 학생 수</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">전체 테넌트 합계</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 스토리지</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStorage.toFixed(2)} GB</div>
              <p className="text-xs text-muted-foreground">사용 중인 저장공간</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI 토큰</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAITokens.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">이번 달 사용량</p>
            </CardContent>
          </Card>
        </div>

        {/* Usage Table */}
        <Card>
          <CardHeader>
            <CardTitle>테넌트별 사용량</CardTitle>
            <CardDescription>각 테넌트의 리소스 사용 현황을 확인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>테넌트명</TableHead>
                  <TableHead>플랜</TableHead>
                  <TableHead>학생 수</TableHead>
                  <TableHead>스토리지</TableHead>
                  <TableHead>AI 토큰</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>최종 업데이트</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      로딩 중...
                    </TableCell>
                  </TableRow>
                ) : tenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      테넌트가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  tenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tenant.name}</p>
                          <p className="text-xs text-muted-foreground">{tenant.id.slice(0, 8)}...</p>
                        </div>
                      </TableCell>
                      <TableCell>{getPlanBadge(tenant.plan)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{tenant.usage?.student_count || 0}</span>
                            <span className="text-muted-foreground">/ {tenant.max_students}</span>
                          </div>
                          <Progress value={tenant.studentUsagePercent} className="h-1" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{(tenant.usage?.storage_used_gb || 0).toFixed(2)} GB</span>
                            <span className="text-muted-foreground">/ {tenant.max_storage_gb} GB</span>
                          </div>
                          <Progress value={tenant.storageUsagePercent} className="h-1" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {(tenant.usage?.ai_tokens_used || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {getUsageBadge(Math.max(tenant.studentUsagePercent, tenant.storageUsagePercent))}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {tenant.usage?.created_at
                          ? new Date(tenant.usage.created_at).toLocaleDateString("ko-KR")
                          : "데이터 없음"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsageManagement;
