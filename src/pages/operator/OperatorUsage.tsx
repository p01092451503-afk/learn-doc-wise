import { useState, useEffect } from "react";
import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { HardDrive, Database, Cpu, Users, Search, RefreshCw, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/operator/EmptyState";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface TenantUsage {
  tenant_id: string;
  tenant_name: string;
  student_count: number;
  storage_used_gb: number;
  max_storage_gb: number;
  ai_tokens_used: number;
  bandwidth_gb: number;
  metric_date: string;
}

const OperatorUsage = () => {
  const [usageData, setUsageData] = useState<TenantUsage[]>([]);
  const [filteredData, setFilteredData] = useState<TenantUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsageData();
  }, []);

  useEffect(() => {
    filterData();
  }, [usageData, searchQuery]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        handleRefresh();
      }, 30000); // 30초마다 자동 새로고침

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const filterData = () => {
    if (!searchQuery) {
      setFilteredData(usageData);
      return;
    }

    const filtered = usageData.filter((usage) =>
      usage.tenant_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsageData();
    setRefreshing(false);
    toast({
      title: "새로고침 완료",
      description: "사용량 데이터가 업데이트되었습니다.",
    });
  };

  const fetchUsageData = async () => {
    try {
      const { data: metrics, error: metricsError } = await supabase
        .from("usage_metrics")
        .select("*")
        .order("metric_date", { ascending: false });

      if (metricsError) throw metricsError;

      const { data: tenants, error: tenantsError } = await supabase
        .from("tenants")
        .select("id, name, max_storage_gb");

      if (tenantsError) throw tenantsError;

      // Group by tenant and get latest metrics
      const latestMetrics = new Map<string, any>();
      metrics?.forEach((metric) => {
        if (!latestMetrics.has(metric.tenant_id)) {
          latestMetrics.set(metric.tenant_id, metric);
        }
      });

      const usage: TenantUsage[] = [];
      latestMetrics.forEach((metric) => {
        const tenant = tenants?.find((t) => t.id === metric.tenant_id);
        if (tenant) {
          usage.push({
            tenant_id: metric.tenant_id,
            tenant_name: tenant.name,
            student_count: metric.student_count,
            storage_used_gb: metric.storage_used_gb,
            max_storage_gb: tenant.max_storage_gb,
            ai_tokens_used: metric.ai_tokens_used,
            bandwidth_gb: metric.bandwidth_gb,
            metric_date: metric.metric_date,
          });
        }
      });

      setUsageData(usage);
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "사용량 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStoragePercentage = (used: number, max: number) => {
    return Math.min((used / max) * 100, 100);
  };

  const getStorageStatus = (percentage: number) => {
    if (percentage >= 90) return "critical";
    if (percentage >= 70) return "warning";
    return "healthy";
  };

  return (
    <OperatorLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">사용량 관리</h1>
            <p className="text-slate-400">전체 고객사의 리소스 사용량을 모니터링합니다</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <Label htmlFor="auto-refresh" className="text-sm text-slate-300 cursor-pointer">
                자동 새로고침 (30초)
              </Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              새로고침
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">총 사용자</CardTitle>
              <Users className="h-4 w-4 text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {usageData.reduce((sum, t) => sum + t.student_count, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">총 스토리지</CardTitle>
              <HardDrive className="h-4 w-4 text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {usageData.reduce((sum, t) => sum + t.storage_used_gb, 0).toFixed(1)} GB
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">AI 토큰 (월)</CardTitle>
              <Cpu className="h-4 w-4 text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {(usageData.reduce((sum, t) => sum + t.ai_tokens_used, 0) / 1000).toFixed(1)}K
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">대역폭</CardTitle>
              <Database className="h-4 w-4 text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {usageData.reduce((sum, t) => sum + t.bandwidth_gb, 0).toFixed(1)} GB
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Section */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="고객사명 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white"
                />
              </div>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSearchQuery("")}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usage Table */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">고객사별 사용량</CardTitle>
            <CardDescription className="text-slate-400">
              {filteredData.length}개 고객사 {searchQuery && `(전체 ${usageData.length}개 중)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-400">로딩 중...</div>
            ) : filteredData.length === 0 ? (
              <EmptyState
                icon={searchQuery ? Search : Database}
                title={searchQuery ? "검색 결과 없음" : "사용량 데이터가 없습니다"}
                description={
                  searchQuery
                    ? "검색 조건에 맞는 고객사가 없습니다."
                    : "고객사가 활동을 시작하면 사용량 데이터가 표시됩니다."
                }
                action={searchQuery ? { label: "검색 초기화", onClick: () => setSearchQuery("") } : undefined}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-400">고객사</TableHead>
                    <TableHead className="text-slate-400">학생 수</TableHead>
                    <TableHead className="text-slate-400">스토리지</TableHead>
                    <TableHead className="text-slate-400">AI 토큰</TableHead>
                    <TableHead className="text-slate-400">대역폭</TableHead>
                    <TableHead className="text-slate-400">상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((usage) => {
                    const storagePercentage = getStoragePercentage(usage.storage_used_gb, usage.max_storage_gb);
                    const status = getStorageStatus(storagePercentage);

                    return (
                      <TableRow key={usage.tenant_id} className="border-slate-800">
                        <TableCell className="font-medium text-white">{usage.tenant_name}</TableCell>
                        <TableCell className="text-slate-400">{usage.student_count}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm text-slate-400">
                              {usage.storage_used_gb.toFixed(1)} / {usage.max_storage_gb} GB
                            </div>
                            <Progress value={storagePercentage} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {(usage.ai_tokens_used / 1000).toFixed(1)}K
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {usage.bandwidth_gb.toFixed(1)} GB
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              status === "critical"
                                ? "bg-red-500/10 text-red-400 border-red-500/50"
                                : status === "warning"
                                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/50"
                                : "bg-green-500/10 text-green-400 border-green-500/50"
                            }
                          >
                            {status === "critical" ? "주의" : status === "warning" ? "경고" : "정상"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </OperatorLayout>
  );
};

export default OperatorUsage;
