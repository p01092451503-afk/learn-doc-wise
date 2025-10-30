import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, AlertTriangle, Activity, Server } from "lucide-react";

interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface SystemLog {
  id: string;
  tenant_id: string | null;
  log_level: string;
  message: string;
  error_details: any;
  created_at: string;
}

const AdminMonitoring = () => {
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const [adminLogsResult, systemLogsResult] = await Promise.all([
        supabase
          .from("admin_access_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("system_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (adminLogsResult.error) throw adminLogsResult.error;
      if (systemLogsResult.error) throw systemLogsResult.error;

      setAdminLogs((adminLogsResult.data || []).map(log => ({
        ...log,
        ip_address: log.ip_address ? String(log.ip_address) : null,
        user_agent: log.user_agent || null
      })));
      setSystemLogs(systemLogsResult.data || []);
    } catch (error) {
      toast({
        title: "오류",
        description: "로그를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getLogLevelBadge = (level: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      INFO: "default",
      WARN: "secondary",
      ERROR: "destructive",
    };
    return <Badge variant={variants[level] || "default"}>{level}</Badge>;
  };

  const errorCount = systemLogs.filter(log => log.log_level === "ERROR").length;
  const warnCount = systemLogs.filter(log => log.log_level === "WARN").length;

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">시스템 모니터링</h1>
          <p className="text-muted-foreground mt-2">보안 및 시스템 로그 모니터링</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">관리자 활동</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminLogs.length}</div>
              <p className="text-xs text-muted-foreground mt-1">최근 50개 활동</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">시스템 상태</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">정상</div>
              <p className="text-xs text-muted-foreground mt-1">모든 서비스 운영중</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">경고</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{warnCount}</div>
              <p className="text-xs text-muted-foreground mt-1">최근 경고 수</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">오류</CardTitle>
              <Activity className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <p className="text-xs text-muted-foreground mt-1">최근 오류 수</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="admin" className="space-y-4">
          <TabsList>
            <TabsTrigger value="admin">관리자 접근 로그</TabsTrigger>
            <TabsTrigger value="system">시스템 로그</TabsTrigger>
          </TabsList>

          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>관리자 활동 로그</CardTitle>
                <CardDescription>관리자의 모든 작업 기록</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>시간</TableHead>
                      <TableHead>작업</TableHead>
                      <TableHead>리소스 타입</TableHead>
                      <TableHead>IP 주소</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell>{log.resource_type || "-"}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.ip_address || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>시스템 로그</CardTitle>
                <CardDescription>시스템 이벤트 및 오류 로그</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>시간</TableHead>
                      <TableHead>레벨</TableHead>
                      <TableHead>메시지</TableHead>
                      <TableHead>상세</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>{getLogLevelBadge(log.log_level)}</TableCell>
                        <TableCell className="max-w-md">
                          <div className="text-sm">{log.message}</div>
                        </TableCell>
                        <TableCell>
                          {log.error_details && (
                            <Badge variant="secondary">상세 정보 있음</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminMonitoring;
