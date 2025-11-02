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
import { cn } from "@/lib/utils";

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
          <h1 className={cn(
            "text-3xl font-bold mb-2 flex items-center gap-3 transition-colors",
            theme === "dark" ? "text-white" : "text-slate-900"
          )}>
            <Brain className="h-8 w-8" />
            AI 로그
            <Badge variant="default" className="text-sm">AI</Badge>
          </h1>
          <p className={cn(
            "transition-colors",
            theme === "dark" ? "text-slate-400" : "text-slate-600"
          )}>전체 AI 사용 기록을 확인합니다</p>
        </div>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className={cn(
            "transition-colors",
            theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className={cn(
                  "text-sm font-medium transition-colors",
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                )}>총 요청</CardTitle>
                <Badge variant="default" className="text-[10px] px-1.5 py-0.5 h-auto">AI</Badge>
              </div>
              <Brain className="h-6 w-6 text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>{filteredLogs.length.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className={cn(
            "transition-colors",
            theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={cn(
                "text-sm font-medium transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              )}>총 토큰</CardTitle>
              <Brain className="h-6 w-6 text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>{(totalTokens / 1000).toFixed(1)}K</div>
            </CardContent>
          </Card>

          <Card className={cn(
            "transition-colors",
            theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={cn(
                "text-sm font-medium transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              )}>모델 종류</CardTitle>
              <Brain className="h-6 w-6 text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>{uniqueModels.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className={cn(
          "transition-colors",
          theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
        )}>
          <CardHeader>
            <CardTitle className={cn(
              "transition-colors",
              theme === "dark" ? "text-white" : "text-slate-900"
            )}>필터</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="고객사 또는 모델 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  "pl-10 transition-colors",
                  theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                )}
              />
            </div>
            <Select value={filterModel} onValueChange={setFilterModel}>
              <SelectTrigger className={cn(
                "w-[200px] transition-colors",
                theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
              )}>
                <SelectValue placeholder="모델 선택" />
              </SelectTrigger>
              <SelectContent className={cn(
                "transition-colors",
                theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
              )}>
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
        <Card className={cn(
          "transition-colors",
          theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
        )}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className={cn(
                "transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>AI 사용 로그</CardTitle>
              <Badge variant="default" className="text-xs">AI</Badge>
            </div>
            <CardDescription className={cn(
              "transition-colors",
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            )}>최근 100개 로그</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className={cn(
                "text-center py-8 transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              )}>로딩 중...</div>
            ) : filteredLogs.length === 0 ? (
              <div className={cn(
                "text-center py-8 transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              )}>로그가 없습니다.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className={cn(
                    "transition-colors",
                    theme === "dark" ? "border-slate-800" : "border-slate-200"
                  )}>
                    <TableHead className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    )}>시간</TableHead>
                    <TableHead className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    )}>고객사</TableHead>
                    <TableHead className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    )}>모델</TableHead>
                    <TableHead className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    )}>프롬프트</TableHead>
                    <TableHead className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    )}>토큰</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className={cn(
                      "transition-colors",
                      theme === "dark" ? "border-slate-800" : "border-slate-200"
                    )}>
                      <TableCell className={cn(
                        "transition-colors",
                        theme === "dark" ? "text-slate-400" : "text-slate-600"
                      )}>
                        {new Date(log.created_at).toLocaleString("ko-KR")}
                      </TableCell>
                      <TableCell className={cn(
                        "font-medium transition-colors",
                        theme === "dark" ? "text-white" : "text-slate-900"
                      )}>{log.tenant_name}</TableCell>
                      <TableCell>
                        <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/50">
                          {log.model_name}
                        </Badge>
                      </TableCell>
                      <TableCell className={cn(
                        "max-w-md truncate transition-colors",
                        theme === "dark" ? "text-slate-400" : "text-slate-600"
                      )}>
                        {log.prompt_text || "-"}
                      </TableCell>
                      <TableCell className={cn(
                        "transition-colors",
                        theme === "dark" ? "text-slate-400" : "text-slate-600"
                      )}>{log.tokens_used.toLocaleString()}</TableCell>
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
