import { useState, useEffect } from "react";
import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle, Server, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { SystemHealthDashboard } from "@/components/admin/SystemHealthDashboard";

interface SystemLog {
  id: string;
  log_level: string;
  message: string;
  error_details: any;
  tenant_id: string | null;
  created_at: string;
  tenant_name?: string;
}

const OperatorMonitoring = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
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
    fetchSystemLogs();
  }, []);

  const fetchSystemLogs = async () => {
    try {
      const { data: systemLogs, error: logsError } = await supabase
        .from("system_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      const { data: tenants, error: tenantsError } = await supabase
        .from("tenants")
        .select("id, name");

      if (tenantsError) throw tenantsError;

      const logsWithTenants: SystemLog[] = (systemLogs || []).map((log) => ({
        ...log,
        tenant_name: log.tenant_id
          ? tenants?.find((t) => t.id === log.tenant_id)?.name || "Unknown"
          : "System",
      }));

      setLogs(logsWithTenants);
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "시스템 로그를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const errorCount = logs.filter((l) => l.log_level === "error").length;
  const warningCount = logs.filter((l) => l.log_level === "warning").length;
  const infoCount = logs.filter((l) => l.log_level === "info").length;

  const getLogLevelBadge = (level: string) => {
    switch (level) {
      case "error":
        return "bg-red-500/10 text-red-400 border-red-500/50";
      case "warning":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/50";
      case "info":
        return "bg-blue-500/10 text-blue-400 border-blue-500/50";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/50";
    }
  };

  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <OperatorLayout>
      <div className="space-y-6">
        <div>
          <h1 className={cn(
            "text-3xl font-bold mb-2 transition-colors flex items-center gap-3",
            theme === "dark" ? "text-white" : "text-slate-900"
          )}>
            <Activity className="h-8 w-8 text-violet-500" />
            시스템 모니터링
          </h1>
          <p className={cn(
            "transition-colors",
            theme === "dark" ? "text-slate-400" : "text-slate-600"
          )}>플랫폼 전체의 시스템 상태를 모니터링합니다</p>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className={cn(
            "transition-colors",
            theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={cn(
                "text-sm font-medium transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              )}>시스템 상태</CardTitle>
              <Server className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">정상</div>
              <p className="text-xs text-slate-500 mt-1">모든 서비스 운영 중</p>
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
              )}>에러</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>{errorCount}</div>
              <p className="text-xs text-slate-500 mt-1">최근 로그</p>
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
              )}>경고</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>{warningCount}</div>
              <p className="text-xs text-slate-500 mt-1">최근 로그</p>
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
              )}>정보</CardTitle>
              <Activity className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>{infoCount}</div>
              <p className="text-xs text-slate-500 mt-1">최근 로그</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="health" className="space-y-4">
          <TabsList className={cn(
            "transition-colors",
            theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
          )}>
            <TabsTrigger value="health">시스템 헬스 체크</TabsTrigger>
            <TabsTrigger value="logs">시스템 로그</TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="space-y-6">
            <SystemHealthDashboard />
          </TabsContent>

          <TabsContent value="logs">
            {/* System Logs Table */}
            <Card className={cn(
              "transition-colors",
              theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "transition-colors",
                  theme === "dark" ? "text-white" : "text-slate-900"
                )}>시스템 로그</CardTitle>
                <CardDescription className={cn(
                  "transition-colors",
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                )}>최근 50개 로그</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className={cn(
                    "text-center py-8 transition-colors",
                    theme === "dark" ? "text-slate-400" : "text-slate-600"
                  )}>로딩 중...</div>
                ) : logs.length === 0 ? (
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
                        )}>레벨</TableHead>
                        <TableHead className={cn(
                          "transition-colors",
                          theme === "dark" ? "text-slate-400" : "text-slate-600"
                        )}>대상</TableHead>
                        <TableHead className={cn(
                          "transition-colors",
                          theme === "dark" ? "text-slate-400" : "text-slate-600"
                        )}>메시지</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
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
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getLogLevelIcon(log.log_level)}
                              <Badge className={getLogLevelBadge(log.log_level)}>
                                {log.log_level.toUpperCase()}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className={cn(
                            "transition-colors",
                            theme === "dark" ? "text-slate-400" : "text-slate-600"
                          )}>{log.tenant_name}</TableCell>
                          <TableCell className={cn(
                            "max-w-md transition-colors",
                            theme === "dark" ? "text-slate-400" : "text-slate-600"
                          )}>
                            <div className="truncate">{log.message}</div>
                            {log.error_details && (
                              <div className="text-xs text-red-400 mt-1 truncate">
                                {JSON.stringify(log.error_details)}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OperatorLayout>
  );
};

export default OperatorMonitoring;
