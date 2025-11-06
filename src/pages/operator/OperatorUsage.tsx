import { useState, useEffect } from "react";
import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { HardDrive, Database, Cpu, Users, Search, RefreshCw, X, Download, Filter, TrendingUp, Activity, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/operator/EmptyState";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RealtimeUsageMonitor } from "@/components/admin/RealtimeUsageMonitor";

interface TenantUsage {
  tenant_id: string;
  tenant_name: string;
  student_count: number;
  storage_used_gb: number;
  max_storage_gb: number;
  ai_tokens_used: number;
  bandwidth_gb: number;
  metric_date: string;
  active_users?: number;
}

interface UsageTrend {
  date: string;
  storage: number;
  tokens: number;
  bandwidth: number;
}

const OperatorUsage = () => {
  const [usageData, setUsageData] = useState<TenantUsage[]>([]);
  const [filteredData, setFilteredData] = useState<TenantUsage[]>([]);
  const [usageTrends, setUsageTrends] = useState<UsageTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("7");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [totalActiveUsers, setTotalActiveUsers] = useState(0);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [collecting, setCollecting] = useState(false);
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

  useEffect(() => {
    fetchUsageData();
    fetchUsageTrends();
    fetchActiveUsers();
  }, [dateRange]);

  useEffect(() => {
    filterData();
  }, [usageData, searchQuery, statusFilter]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        handleRefresh();
      }, 30000); // 30초마다 자동 새로고침

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const filterData = () => {
    let filtered = usageData;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((usage) =>
        usage.tenant_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((usage) => {
        const percentage = getStoragePercentage(usage.storage_used_gb, usage.max_storage_gb);
        const status = getStorageStatus(percentage);
        return status === statusFilter;
      });
    }

    setFilteredData(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUsageData(), fetchUsageTrends(), fetchActiveUsers()]);
    setRefreshing(false);
    toast({
      title: "새로고침 완료",
      description: "사용량 데이터가 업데이트되었습니다.",
    });
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

      await handleRefresh();
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
          : "모든 고객사가 제한 내에서 운영 중입니다.",
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

  const handleExportCSV = () => {
    const headers = ["고객사", "학생 수", "활성 사용자", "스토리지(GB)", "최대 스토리지(GB)", "AI 토큰", "대역폭(GB)", "상태", "날짜"];
    const rows = filteredData.map((usage) => {
      const percentage = getStoragePercentage(usage.storage_used_gb, usage.max_storage_gb);
      const status = getStorageStatus(percentage);
      return [
        usage.tenant_name,
        usage.student_count,
        usage.active_users || 0,
        usage.storage_used_gb.toFixed(2),
        usage.max_storage_gb,
        usage.ai_tokens_used,
        usage.bandwidth_gb.toFixed(2),
        status === "critical" ? "주의" : status === "warning" ? "경고" : "정상",
        usage.metric_date,
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `usage-report-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "내보내기 완료",
      description: "사용량 리포트가 CSV 파일로 다운로드되었습니다.",
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
      for (const [tenantId, metric] of latestMetrics) {
        const tenant = tenants?.find((t) => t.id === tenantId);
        if (tenant) {
          // Fetch active users count (users who logged in within last 7 days)
          const { count: activeCount } = await supabase
            .from("memberships")
            .select("user_id", { count: "exact", head: true })
            .eq("tenant_id", tenantId)
            .eq("is_active", true);

          usage.push({
            tenant_id: tenantId,
            tenant_name: tenant.name,
            student_count: metric.student_count,
            storage_used_gb: metric.storage_used_gb,
            max_storage_gb: tenant.max_storage_gb,
            ai_tokens_used: metric.ai_tokens_used,
            bandwidth_gb: metric.bandwidth_gb,
            metric_date: metric.metric_date,
            active_users: activeCount || 0,
          });
        }
      }

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

  const fetchUsageTrends = async () => {
    try {
      const daysAgo = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data: metrics, error } = await supabase
        .from("usage_metrics")
        .select("metric_date, storage_used_gb, ai_tokens_used, bandwidth_gb")
        .gte("metric_date", startDate.toISOString().split("T")[0])
        .order("metric_date", { ascending: true });

      if (error) throw error;

      // Aggregate by date
      const trendMap = new Map<string, { storage: number; tokens: number; bandwidth: number }>();
      metrics?.forEach((metric) => {
        const existing = trendMap.get(metric.metric_date) || { storage: 0, tokens: 0, bandwidth: 0 };
        trendMap.set(metric.metric_date, {
          storage: existing.storage + metric.storage_used_gb,
          tokens: existing.tokens + metric.ai_tokens_used,
          bandwidth: existing.bandwidth + metric.bandwidth_gb,
        });
      });

      const trends: UsageTrend[] = Array.from(trendMap.entries()).map(([date, values]) => ({
        date,
        storage: parseFloat(values.storage.toFixed(2)),
        tokens: Math.round(values.tokens / 1000), // Convert to K
        bandwidth: parseFloat(values.bandwidth.toFixed(2)),
      }));

      setUsageTrends(trends);
    } catch (error: any) {
      console.error("Failed to fetch usage trends:", error);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const { count, error } = await supabase
        .from("memberships")
        .select("user_id", { count: "exact", head: true })
        .eq("is_active", true)
        .not("tenant_id", "is", null);

      if (error) throw error;
      setTotalActiveUsers(count || 0);
    } catch (error: any) {
      console.error("Failed to fetch active users:", error);
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
            <h1 className={cn(
              "text-3xl font-bold mb-2 transition-colors flex items-center gap-3",
              theme === "dark" ? "text-white" : "text-slate-900"
            )}>
              <Activity className="h-8 w-8 text-violet-500" />
              사용량 모니터링
            </h1>
            <p className={cn(
              "transition-colors",
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            )}>전체 고객사의 실시간 리소스 사용량 및 활성 사용자를 모니터링합니다</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCheckLimits}
              className={cn(
                "gap-2 transition-colors",
                theme === "dark"
                  ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                  : "border-slate-300 text-slate-700 hover:bg-slate-100"
              )}
            >
              <AlertTriangle className="h-4 w-4" />
              제한 확인
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCollectMetrics}
              disabled={collecting}
              className={cn(
                "gap-2 transition-colors",
                theme === "dark"
                  ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                  : "border-slate-300 text-slate-700 hover:bg-slate-100"
              )}
            >
              <Database className={`h-4 w-4 ${collecting ? "animate-spin" : ""}`} />
              사용량 수집
            </Button>
            <div className="flex items-center gap-2">
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <Label 
                htmlFor="auto-refresh" 
                className={cn(
                  "text-sm cursor-pointer transition-colors",
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                )}
              >
                자동 새로고침
              </Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className={cn(
                "gap-2 transition-colors",
                theme === "dark"
                  ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                  : "border-slate-300 text-slate-700 hover:bg-slate-100"
              )}
            >
              <Download className="h-4 w-4" />
              내보내기
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className={cn(
                "gap-2 transition-colors",
                theme === "dark"
                  ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                  : "border-slate-300 text-slate-700 hover:bg-slate-100"
              )}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              새로고침
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className={cn(
            "transition-colors",
            theme === "dark" 
              ? "bg-slate-900/50 border-slate-800" 
              : "bg-white border-slate-200"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={cn(
                "text-sm font-medium transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              )}>총 사용자</CardTitle>
              <Users className="h-4 w-4 text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>
                {usageData.reduce((sum, t) => sum + t.student_count, 0).toLocaleString()}
              </div>
              <p className={cn(
                "text-xs mt-1 transition-colors",
                theme === "dark" ? "text-slate-500" : "text-slate-600"
              )}>
                활성: {totalActiveUsers.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className={cn(
            "transition-colors",
            theme === "dark" 
              ? "bg-slate-900/50 border-slate-800" 
              : "bg-white border-slate-200"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={cn(
                "text-sm font-medium transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              )}>총 스토리지</CardTitle>
              <HardDrive className="h-4 w-4 text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>
                {usageData.reduce((sum, t) => sum + t.storage_used_gb, 0).toFixed(1)} GB
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "transition-colors",
            theme === "dark" 
              ? "bg-slate-900/50 border-slate-800" 
              : "bg-white border-slate-200"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={cn(
                "text-sm font-medium transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              )}>AI 토큰 (월)</CardTitle>
              <Cpu className="h-4 w-4 text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>
                {(usageData.reduce((sum, t) => sum + t.ai_tokens_used, 0) / 1000).toFixed(1)}K
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "transition-colors",
            theme === "dark" 
              ? "bg-slate-900/50 border-slate-800" 
              : "bg-white border-slate-200"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={cn(
                "text-sm font-medium transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              )}>대역폭</CardTitle>
              <Database className="h-4 w-4 text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>
                {usageData.reduce((sum, t) => sum + t.bandwidth_gb, 0).toFixed(1)} GB
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className={cn(
          "transition-colors",
          theme === "dark" 
            ? "bg-slate-900/50 border-slate-800" 
            : "bg-white border-slate-200"
        )}>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className={cn(
                  "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors",
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                )} />
                <Input
                  placeholder="고객사명 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "pl-10 transition-colors",
                    theme === "dark"
                      ? "bg-slate-800 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  )}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className={cn(
                  "w-full sm:w-[180px] transition-colors",
                  theme === "dark"
                    ? "bg-slate-800 border-slate-700 text-white"
                    : "bg-slate-50 border-slate-300 text-slate-900"
                )}>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상태</SelectItem>
                  <SelectItem value="healthy">정상</SelectItem>
                  <SelectItem value="warning">경고</SelectItem>
                  <SelectItem value="critical">주의</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className={cn(
                  "w-full sm:w-[180px] transition-colors",
                  theme === "dark"
                    ? "bg-slate-800 border-slate-700 text-white"
                    : "bg-slate-50 border-slate-300 text-slate-900"
                )}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="기간" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">최근 7일</SelectItem>
                  <SelectItem value="14">최근 14일</SelectItem>
                  <SelectItem value="30">최근 30일</SelectItem>
                  <SelectItem value="90">최근 90일</SelectItem>
                </SelectContent>
              </Select>
              {(searchQuery || statusFilter !== "all") && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  className={cn(
                    "transition-colors",
                    theme === "dark"
                      ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                      : "border-slate-300 text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usage Trends Chart */}
        {usageTrends.length > 0 && (
          <Card className={cn(
            "transition-colors",
            theme === "dark" 
              ? "bg-slate-900/50 border-slate-800" 
              : "bg-white border-slate-200"
          )}>
            <CardHeader>
              <CardTitle className={cn(
                "transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>사용량 추이</CardTitle>
              <CardDescription className={cn(
                "transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              )}>최근 {dateRange}일간의 전체 사용량 변화</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={usageTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#334155" : "#e2e8f0"} />
                  <XAxis 
                    dataKey="date" 
                    stroke={theme === "dark" ? "#94a3b8" : "#64748b"}
                    tick={{ fill: theme === "dark" ? "#94a3b8" : "#64748b" }}
                  />
                  <YAxis 
                    stroke={theme === "dark" ? "#94a3b8" : "#64748b"}
                    tick={{ fill: theme === "dark" ? "#94a3b8" : "#64748b" }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                      border: `1px solid ${theme === "dark" ? "#334155" : "#e2e8f0"}`,
                      borderRadius: "8px",
                      color: theme === "dark" ? "#ffffff" : "#000000"
                    }}
                  />
                  <Legend 
                    wrapperStyle={{
                      color: theme === "dark" ? "#94a3b8" : "#64748b"
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="storage" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="스토리지 (GB)"
                    dot={{ fill: "#8b5cf6" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tokens" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    name="AI 토큰 (K)"
                    dot={{ fill: "#06b6d4" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bandwidth" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="대역폭 (GB)"
                    dot={{ fill: "#10b981" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Usage Table with Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">전체 현황</TabsTrigger>
            <TabsTrigger value="realtime">실시간 모니터링</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className={cn(
              "transition-colors",
              theme === "dark" 
                ? "bg-slate-900/50 border-slate-800" 
                : "bg-white border-slate-200"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "transition-colors",
                  theme === "dark" ? "text-white" : "text-slate-900"
                )}>고객사별 사용량</CardTitle>
                <CardDescription className={cn(
                  "transition-colors",
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                )}>
                  {filteredData.length}개 고객사 {searchQuery && `(전체 ${usageData.length}개 중)`}
                </CardDescription>
              </CardHeader>
              <CardContent>
            {loading ? (
              <div className={cn(
                "text-center py-8 transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              )}>로딩 중...</div>
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
                theme={theme}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className={cn(
                    "transition-colors cursor-pointer hover:bg-muted/50",
                    theme === "dark" ? "border-slate-800" : "border-slate-200"
                  )}>
                    <TableHead className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    )}>고객사</TableHead>
                    <TableHead className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    )}>학생 수</TableHead>
                    <TableHead className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    )}>활성 사용자</TableHead>
                    <TableHead className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    )}>스토리지</TableHead>
                    <TableHead className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    )}>AI 토큰</TableHead>
                    <TableHead className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    )}>대역폭</TableHead>
                    <TableHead className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    )}>상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((usage) => {
                    const storagePercentage = getStoragePercentage(usage.storage_used_gb, usage.max_storage_gb);
                    const status = getStorageStatus(storagePercentage);

                    return (
                      <TableRow 
                        key={usage.tenant_id} 
                        className={cn(
                          "transition-colors cursor-pointer hover:bg-muted/50",
                          theme === "dark" ? "border-slate-800" : "border-slate-200"
                        )}
                        onClick={() => {
                          setSelectedTenant(usage.tenant_id);
                          const element = document.querySelector('[value="realtime"]');
                          if (element) (element as HTMLElement).click();
                        }}
                      >
                        <TableCell className={cn(
                          "font-medium transition-colors",
                          theme === "dark" ? "text-white" : "text-slate-900"
                        )}>{usage.tenant_name}</TableCell>
                        <TableCell className={cn(
                          "transition-colors",
                          theme === "dark" ? "text-slate-400" : "text-slate-600"
                        )}>{usage.student_count}</TableCell>
                        <TableCell className={cn(
                          "transition-colors",
                          theme === "dark" ? "text-slate-400" : "text-slate-600"
                        )}>
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-green-500" />
                            {usage.active_users || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className={cn(
                              "text-sm transition-colors",
                              theme === "dark" ? "text-slate-400" : "text-slate-600"
                            )}>
                              {usage.storage_used_gb.toFixed(1)} / {usage.max_storage_gb} GB
                            </div>
                            <Progress value={storagePercentage} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell className={cn(
                          "transition-colors",
                          theme === "dark" ? "text-slate-400" : "text-slate-600"
                        )}>
                          {(usage.ai_tokens_used / 1000).toFixed(1)}K
                        </TableCell>
                        <TableCell className={cn(
                          "transition-colors",
                          theme === "dark" ? "text-slate-400" : "text-slate-600"
                        )}>
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
          </TabsContent>

          <TabsContent value="realtime">
            {selectedTenant ? (
              <RealtimeUsageMonitor tenantId={selectedTenant} />
            ) : (
              <Card className={cn(
                "transition-colors",
                theme === "dark" 
                  ? "bg-slate-900/50 border-slate-800" 
                  : "bg-white border-slate-200"
              )}>
                <CardContent className="py-12 text-center">
                  <p className={cn(
                    "transition-colors",
                    theme === "dark" ? "text-slate-400" : "text-slate-600"
                  )}>
                    전체 현황 탭에서 고객사를 선택하여 실시간 모니터링을 시작하세요.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </OperatorLayout>
  );
};

export default OperatorUsage;
