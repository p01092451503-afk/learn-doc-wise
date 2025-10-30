import { useState, useEffect } from "react";
import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle, Server, Activity } from "lucide-react";

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
  const { toast } = useToast();

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
          <h1 className="text-3xl font-bold text-white mb-2">시스템 모니터링</h1>
          <p className="text-slate-400">플랫폼 전체의 시스템 상태를 모니터링합니다</p>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">시스템 상태</CardTitle>
              <Server className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">정상</div>
              <p className="text-xs text-slate-500 mt-1">모든 서비스 운영 중</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">에러</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{errorCount}</div>
              <p className="text-xs text-slate-500 mt-1">최근 로그</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">경고</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{warningCount}</div>
              <p className="text-xs text-slate-500 mt-1">최근 로그</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">정보</CardTitle>
              <Activity className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{infoCount}</div>
              <p className="text-xs text-slate-500 mt-1">최근 로그</p>
            </CardContent>
          </Card>
        </div>

        {/* System Logs Table */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">시스템 로그</CardTitle>
            <CardDescription className="text-slate-400">최근 50개 로그</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-400">로딩 중...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-slate-400">로그가 없습니다.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-400">시간</TableHead>
                    <TableHead className="text-slate-400">레벨</TableHead>
                    <TableHead className="text-slate-400">대상</TableHead>
                    <TableHead className="text-slate-400">메시지</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="border-slate-800">
                      <TableCell className="text-slate-400">
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
                      <TableCell className="text-slate-400">{log.tenant_name}</TableCell>
                      <TableCell className="text-slate-400 max-w-md">
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
      </div>
    </OperatorLayout>
  );
};

export default OperatorMonitoring;
