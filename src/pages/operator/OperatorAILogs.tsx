import { useState, useEffect } from "react";
import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Brain, Search } from "lucide-react";

interface AILog {
  id: string;
  tenant_id: string;
  user_id: string;
  model_name: string;
  prompt_text: string;
  tokens_used: number;
  created_at: string;
  tenant_name?: string;
}

const OperatorAILogs = () => {
  const [logs, setLogs] = useState<AILog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModel, setFilterModel] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchAILogs();
  }, []);

  const fetchAILogs = async () => {
    try {
      const { data: aiLogs, error: logsError } = await supabase
        .from("ai_usage_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (logsError) throw logsError;

      const { data: tenants, error: tenantsError } = await supabase
        .from("tenants")
        .select("id, name");

      if (tenantsError) throw tenantsError;

      const logsWithTenants: AILog[] = (aiLogs || []).map((log) => ({
        ...log,
        tenant_name: tenants?.find((t) => t.id === log.tenant_id)?.name || "Unknown",
      }));

      setLogs(logsWithTenants);
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "AI 로그를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.model_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModel = filterModel === "all" || log.model_name === filterModel;
    return matchesSearch && matchesModel;
  });

  const uniqueModels = Array.from(new Set(logs.map((log) => log.model_name).filter(Boolean)));

  const totalTokens = filteredLogs.reduce((sum, log) => sum + log.tokens_used, 0);

  return (
    <OperatorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            AI 로그
            <Badge variant="default" className="text-sm">AI</Badge>
          </h1>
          <p className="text-slate-400">전체 AI 사용 기록을 확인합니다</p>
        </div>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium text-slate-400">총 요청</CardTitle>
                <Badge variant="default" className="text-[10px] px-1.5 py-0.5 h-auto">AI</Badge>
              </div>
              <Brain className="h-6 w-6 text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{filteredLogs.length.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">총 토큰</CardTitle>
              <Brain className="h-6 w-6 text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{(totalTokens / 1000).toFixed(1)}K</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">모델 종류</CardTitle>
              <Brain className="h-6 w-6 text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{uniqueModels.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">필터</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="고객사 또는 모델 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <Select value={filterModel} onValueChange={setFilterModel}>
              <SelectTrigger className="w-[200px] bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="모델 선택" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">모든 모델</SelectItem>
                {uniqueModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-white">AI 사용 로그</CardTitle>
              <Badge variant="default" className="text-xs">AI</Badge>
            </div>
            <CardDescription className="text-slate-400">최근 100개 로그</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-400">로딩 중...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-400">로그가 없습니다.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-400">시간</TableHead>
                    <TableHead className="text-slate-400">고객사</TableHead>
                    <TableHead className="text-slate-400">모델</TableHead>
                    <TableHead className="text-slate-400">프롬프트</TableHead>
                    <TableHead className="text-slate-400">토큰</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="border-slate-800">
                      <TableCell className="text-slate-400">
                        {new Date(log.created_at).toLocaleString("ko-KR")}
                      </TableCell>
                      <TableCell className="font-medium text-white">{log.tenant_name}</TableCell>
                      <TableCell>
                        <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/50">
                          {log.model_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400 max-w-md truncate">
                        {log.prompt_text || "-"}
                      </TableCell>
                      <TableCell className="text-slate-400">{log.tokens_used.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </OperatorLayout>
  );
};

export default OperatorAILogs;
