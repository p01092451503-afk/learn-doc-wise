import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Brain, Activity, TrendingUp, Database } from "lucide-react";

interface AILog {
  id: string;
  tenant_id: string;
  user_id: string | null;
  prompt_text: string | null;
  response_text: string | null;
  tokens_used: number;
  model_name: string | null;
  created_at: string;
}

interface AIStats {
  totalLogs: number;
  totalTokens: number;
  avgTokensPerRequest: number;
  todayLogs: number;
}

const AdminAILogs = () => {
  const [logs, setLogs] = useState<AILog[]>([]);
  const [stats, setStats] = useState<AIStats>({
    totalLogs: 0,
    totalTokens: 0,
    avgTokensPerRequest: 0,
    todayLogs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchAILogs();
    fetchStats();
  }, []);

  const fetchAILogs = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_usage_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      toast({
        title: "오류",
        description: "AI 로그를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: allLogs, error } = await supabase
        .from("ai_usage_logs")
        .select("tokens_used, created_at");

      if (error) throw error;

      const today = new Date().toDateString();
      const todayLogs = allLogs?.filter(
        log => new Date(log.created_at).toDateString() === today
      ).length || 0;

      const totalTokens = allLogs?.reduce((sum, log) => sum + log.tokens_used, 0) || 0;
      const totalLogs = allLogs?.length || 0;

      setStats({
        totalLogs,
        totalTokens,
        avgTokensPerRequest: totalLogs > 0 ? Math.round(totalTokens / totalLogs) : 0,
        todayLogs,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.prompt_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.model_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const truncateText = (text: string | null, maxLength: number = 100) => {
    if (!text) return "-";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Brain className="h-7 w-7 text-primary" />
            AI 로그 관리
            <Badge variant="default" className="text-sm">AI</Badge>
          </h1>
          <p className="text-muted-foreground mt-2">AI 사용량 및 프롬프트 히스토리 모니터링</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">총 요청 수</CardTitle>
                <Badge variant="default" className="text-[10px] px-1.5 py-0.5 h-auto">AI</Badge>
              </div>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLogs.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">누적 AI 호출</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 토큰 사용</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTokens.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">누적 토큰</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 토큰/요청</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgTokensPerRequest.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">요청당 평균</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">오늘 요청</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayLogs.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">금일 AI 호출</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>AI 사용 로그</CardTitle>
              <Badge variant="default" className="text-xs">AI</Badge>
            </div>
            <CardDescription>최근 100개의 AI 요청 히스토리</CardDescription>
            <div className="mt-4">
              <Input
                placeholder="프롬프트 또는 모델명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>시간</TableHead>
                  <TableHead>모델</TableHead>
                  <TableHead>프롬프트</TableHead>
                  <TableHead>응답</TableHead>
                  <TableHead>토큰</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{log.model_name || "Unknown"}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm text-muted-foreground">
                        {truncateText(log.prompt_text, 80)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm text-muted-foreground">
                        {truncateText(log.response_text, 80)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge>{log.tokens_used.toLocaleString()}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminAILogs;
