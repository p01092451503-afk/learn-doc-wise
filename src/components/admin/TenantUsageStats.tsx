import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, HardDrive, Zap, TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AtomLoader } from "@/components/AtomLoader";

interface TenantInfo {
  max_students: number;
  max_storage_gb: number;
  max_ai_tokens: number;
  current_students?: number;
  storage_used_gb?: number;
  ai_tokens_used?: number;
}

interface UsageTrend {
  date: string;
  students: number;
  storage: number;
  tokens: number;
}

interface TenantUsageStatsProps {
  tenantId: string;
  tenantInfo: TenantInfo;
}

const TenantUsageStats = ({ tenantId, tenantInfo }: TenantUsageStatsProps) => {
  const [usageTrends, setUsageTrends] = useState<UsageTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsageTrends();
  }, [tenantId]);

  const fetchUsageTrends = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("usage_metrics")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: true })
        .limit(30);

      if (error) throw error;

      const trends = data.map((metric) => ({
        date: new Date(metric.metric_date).toLocaleDateString("ko-KR", {
          month: "short",
          day: "numeric",
        }),
        students: metric.student_count || 0,
        storage: metric.storage_used_gb || 0,
        tokens: metric.ai_tokens_used || 0,
      }));

      setUsageTrends(trends);
    } catch (error: any) {
      console.error("Error fetching usage trends:", error);
      toast({
        title: "오류",
        description: "사용량 추이를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (used: number, max: number) => {
    if (max === 0) return 0;
    return Math.round((used / max) * 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const studentUsage = calculatePercentage(
    tenantInfo.current_students || 0,
    tenantInfo.max_students
  );
  const storageUsage = calculatePercentage(
    tenantInfo.storage_used_gb || 0,
    tenantInfo.max_storage_gb
  );
  const tokenUsage = calculatePercentage(
    tenantInfo.ai_tokens_used || 0,
    tenantInfo.max_ai_tokens
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <AtomLoader />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Usage Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">학생 수</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenantInfo.current_students || 0} / {tenantInfo.max_students}
            </div>
            <Progress
              value={studentUsage}
              className={`mt-2 ${getProgressColor(studentUsage)}`}
            />
            <p className="text-xs text-muted-foreground mt-2">
              사용률: {studentUsage}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">저장공간</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenantInfo.storage_used_gb || 0} / {tenantInfo.max_storage_gb} GB
            </div>
            <Progress
              value={storageUsage}
              className={`mt-2 ${getProgressColor(storageUsage)}`}
            />
            <p className="text-xs text-muted-foreground mt-2">
              사용률: {storageUsage}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI 토큰</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(tenantInfo.ai_tokens_used || 0).toLocaleString()} /{" "}
              {tenantInfo.max_ai_tokens.toLocaleString()}
            </div>
            <Progress
              value={tokenUsage}
              className={`mt-2 ${getProgressColor(tokenUsage)}`}
            />
            <p className="text-xs text-muted-foreground mt-2">
              사용률: {tokenUsage}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trends Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              학생 수 추이
            </CardTitle>
            <CardDescription>최근 30일간 학생 등록 추이</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={usageTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              리소스 사용 추이
            </CardTitle>
            <CardDescription>저장공간 및 AI 토큰 사용량</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={usageTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="storage" fill="hsl(var(--primary))" name="저장공간 (GB)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TenantUsageStats;
