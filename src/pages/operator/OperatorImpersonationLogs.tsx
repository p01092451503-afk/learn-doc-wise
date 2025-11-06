import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Clock, AlertCircle, Filter, X, TrendingUp, Activity, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Line, Bar } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart,
  BarChart as RechartsBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function OperatorImpersonationLogs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statsView, setStatsView] = useState<"daily" | "weekly" | "monthly">("daily");
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("operator-theme");
    return (saved as "dark" | "light") || "dark";
  });

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

  // Setup real-time subscription for session updates
  useEffect(() => {
    console.log("Setting up real-time subscription for impersonation sessions...");
    
    const channel = supabase
      .channel("impersonation-sessions-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "impersonation_sessions",
        },
        (payload) => {
          console.log("New session started:", payload);
          
          // Refetch sessions data
          queryClient.invalidateQueries({ queryKey: ["impersonation-sessions"] });
          queryClient.invalidateQueries({ queryKey: ["impersonation-stats"] });
          
          // Show toast notification
          toast({
            title: "새로운 대리 로그인 세션",
            description: "새로운 대리 로그인 세션이 시작되었습니다.",
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "impersonation_sessions",
        },
        (payload) => {
          console.log("Session updated:", payload);
          
          // Refetch sessions data
          queryClient.invalidateQueries({ queryKey: ["impersonation-sessions"] });
          queryClient.invalidateQueries({ queryKey: ["impersonation-stats"] });
          
          // Show toast notification if session ended
          if (payload.new && !payload.new.is_active && payload.old && payload.old.is_active) {
            toast({
              title: "세션 종료",
              description: "대리 로그인 세션이 종료되었습니다.",
              variant: "default",
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.log("✅ Successfully subscribed to impersonation sessions updates");
        }
      });

    return () => {
      console.log("Cleaning up real-time subscription...");
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);

  // Fetch impersonation sessions
  const { data: sessions, refetch: refetchSessions } = useQuery({
    queryKey: ["impersonation-sessions", statusFilter, searchTerm, dateFrom, dateTo],
    queryFn: async () => {
      let query = supabase
        .from("impersonation_sessions")
        .select(`
          *,
          operator:operator_id(id, email),
          target_user:target_user_id(id, email),
          tenant:target_tenant_id(name)
        `)
        .order("started_at", { ascending: false });

      if (statusFilter === "active") {
        query = query.eq("is_active", true);
      } else if (statusFilter === "expired") {
        query = query.eq("is_active", false);
      }

      if (dateFrom) {
        query = query.gte("started_at", dateFrom);
      }
      if (dateTo) {
        query = query.lte("started_at", dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Client-side search filter
      if (searchTerm) {
        return data?.filter(
          (session: any) =>
            session.operator?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.target_user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.tenant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.reason?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return data;
    },
  });

  // Fetch audit logs for impersonation
  const { data: auditLogs } = useQuery({
    queryKey: ["impersonation-audit-logs", searchTerm, dateFrom, dateTo],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs_v2")
        .select("*")
        .in("action", ["impersonation_started", "impersonation_ended"])
        .order("created_at", { ascending: false })
        .limit(100);

      if (dateFrom) {
        query = query.gte("created_at", dateFrom);
      }
      if (dateTo) {
        query = query.lte("created_at", dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch statistics data
  const { data: statsData } = useQuery({
    queryKey: ["impersonation-stats", statsView],
    queryFn: async () => {
      const now = new Date();
      let startDate = new Date();
      
      if (statsView === "daily") {
        startDate.setDate(now.getDate() - 30); // Last 30 days
      } else if (statsView === "weekly") {
        startDate.setDate(now.getDate() - 84); // Last 12 weeks
      } else {
        startDate.setMonth(now.getMonth() - 12); // Last 12 months
      }

      const { data, error } = await supabase
        .from("impersonation_sessions")
        .select("started_at, ended_at, is_active")
        .gte("started_at", startDate.toISOString())
        .order("started_at", { ascending: true });

      if (error) throw error;

      // Group data by period
      const grouped: { [key: string]: { count: number; duration: number } } = {};

      data?.forEach((session: any) => {
        const date = new Date(session.started_at);
        let key: string;

        if (statsView === "daily") {
          key = date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
        } else if (statsView === "weekly") {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
        } else {
          key = date.toLocaleDateString("ko-KR", { year: "numeric", month: "short" });
        }

        if (!grouped[key]) {
          grouped[key] = { count: 0, duration: 0 };
        }

        grouped[key].count++;

        if (session.ended_at) {
          const duration = new Date(session.ended_at).getTime() - new Date(session.started_at).getTime();
          grouped[key].duration += duration / (1000 * 60); // Convert to minutes
        }
      });

      return Object.entries(grouped).map(([period, data]) => ({
        period,
        sessions: data.count,
        avgDuration: data.count > 0 ? Math.round(data.duration / data.count) : 0,
      }));
    },
  });

  const handleEndSession = async (sessionId: string) => {
    try {
      const { error } = await supabase.functions.invoke("end-impersonation", {
        body: { session_id: sessionId },
      });

      if (error) throw error;

      toast({
        title: "세션 종료",
        description: "대리 로그인 세션이 강제 종료되었습니다.",
      });

      refetchSessions();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "세션 종료에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const activeSessions = sessions?.filter((s: any) => s.is_active) || [];
  const expiredSessions = sessions?.filter((s: any) => !s.is_active) || [];

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
              대리 로그인 세션 관리
            </h1>
            <p className={cn(
              "transition-colors",
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            )}>운영자의 대리 로그인 세션 및 접속 이력을 관리합니다</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-green-600">실시간 모니터링 중</span>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
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
              )}>활성 세션</CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>{activeSessions.length}</div>
              <p className={cn(
                "text-xs mt-1 transition-colors",
                theme === "dark" ? "text-slate-500" : "text-slate-600"
              )}>현재 진행 중인 세션</p>
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
              )}>만료된 세션</CardTitle>
              <Clock className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>{expiredSessions.length}</div>
              <p className={cn(
                "text-xs mt-1 transition-colors",
                theme === "dark" ? "text-slate-500" : "text-slate-600"
              )}>종료된 세션 (필터링 범위 내)</p>
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
              )}>접속 이력</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>{auditLogs?.length || 0}</div>
              <p className={cn(
                "text-xs mt-1 transition-colors",
                theme === "dark" ? "text-slate-500" : "text-slate-600"
              )}>기록된 이벤트</p>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Charts */}
        <Card className={cn(
          "transition-colors",
          theme === "dark" 
            ? "bg-slate-900/50 border-slate-800" 
            : "bg-white border-slate-200"
        )}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={cn(
                "flex items-center gap-2 transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>
                <TrendingUp className="h-5 w-5 text-violet-500" />
                사용 통계
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={statsView === "daily" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatsView("daily")}
                  className={cn(
                    "transition-colors",
                    statsView === "daily" 
                      ? "" 
                      : theme === "dark"
                      ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                      : "border-slate-300 text-slate-700 hover:bg-slate-100"
                  )}
                >
                  일별
                </Button>
                <Button
                  variant={statsView === "weekly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatsView("weekly")}
                  className={cn(
                    "transition-colors",
                    statsView === "weekly" 
                      ? "" 
                      : theme === "dark"
                      ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                      : "border-slate-300 text-slate-700 hover:bg-slate-100"
                  )}
                >
                  주별
                </Button>
                <Button
                  variant={statsView === "monthly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatsView("monthly")}
                  className={cn(
                    "transition-colors",
                    statsView === "monthly" 
                      ? "" 
                      : theme === "dark"
                      ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                      : "border-slate-300 text-slate-700 hover:bg-slate-100"
                  )}
                >
                  월별
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className={cn(
                  "text-sm font-medium mb-4 transition-colors",
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                )}>세션 수</h4>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsBarChart data={statsData || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="period" 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="sessions" 
                    fill="hsl(var(--primary))" 
                    radius={[8, 8, 0, 0]}
                  />
                </RechartsBarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h4 className={cn(
                  "text-sm font-medium mb-4 transition-colors",
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                )}>평균 세션 시간 (분)</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={statsData || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="period" 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgDuration" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className={cn(
          "transition-colors",
          theme === "dark" 
            ? "bg-slate-900/50 border-slate-800" 
            : "bg-white border-slate-200"
        )}>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className={cn(
                  "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors",
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                )} />
                <Input
                  placeholder="이메일, 테넌트, 사유 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn(
                    "pl-10 transition-colors",
                    theme === "dark"
                      ? "bg-slate-800 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  )}
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={statusFilter}
                  onValueChange={(value: any) => setStatusFilter(value)}
                >
                  <SelectTrigger className={cn(
                    "w-[140px] transition-colors",
                    theme === "dark"
                      ? "bg-slate-800 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  )}>
                    <SelectValue placeholder="상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="active">활성</SelectItem>
                    <SelectItem value="expired">만료</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  type="date"
                  placeholder="시작 날짜"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className={cn(
                    "w-[160px] transition-colors",
                    theme === "dark"
                      ? "bg-slate-800 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  )}
                />
                
                <Input
                  type="date"
                  placeholder="종료 날짜"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className={cn(
                    "w-[160px] transition-colors",
                    theme === "dark"
                      ? "bg-slate-800 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  )}
                />

                {(searchTerm || statusFilter !== "all" || dateFrom || dateTo) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className={cn(
                      "gap-2 transition-colors",
                      theme === "dark"
                        ? "text-slate-300 hover:bg-slate-800"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <X className="h-4 w-4" />
                    초기화
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Sessions and Audit Logs */}
        <Tabs defaultValue="sessions" className="space-y-4">
          <TabsList className={cn(
            theme === "dark" 
              ? "bg-slate-800 border-slate-700" 
              : "bg-slate-100 border-slate-200"
          )}>
            <TabsTrigger value="sessions">세션 목록</TabsTrigger>
            <TabsTrigger value="audit">접속 이력</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="space-y-4">
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
                )}>대리 로그인 세션</CardTitle>
              </CardHeader>
              <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>상태</TableHead>
                    <TableHead>운영자</TableHead>
                    <TableHead>대상 테넌트</TableHead>
                    <TableHead>사유</TableHead>
                    <TableHead>시작 시간</TableHead>
                    <TableHead>종료 시간</TableHead>
                    <TableHead>만료 시간</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        세션이 없습니다
                      </TableCell>
                    </TableRow>
                  ) : (
                    sessions?.map((session: any) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          {session.is_active ? (
                            <Badge className="bg-green-600">활성</Badge>
                          ) : (
                            <Badge variant="secondary">만료</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {session.operator?.email || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>{session.tenant?.name || "N/A"}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {session.reason}
                        </TableCell>
                        <TableCell>
                          {new Date(session.started_at).toLocaleString("ko-KR")}
                        </TableCell>
                        <TableCell>
                          {session.ended_at
                            ? new Date(session.ended_at).toLocaleString("ko-KR")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {new Date(session.expires_at).toLocaleString("ko-KR")}
                        </TableCell>
                        <TableCell>
                          {session.is_active && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleEndSession(session.id)}
                            >
                              강제 종료
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
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
              )}>접속 이력</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>액션</TableHead>
                    <TableHead>운영자</TableHead>
                    <TableHead>테넌트</TableHead>
                    <TableHead>메타데이터</TableHead>
                    <TableHead>시간</TableHead>
                    <TableHead>IP 주소</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs?.length === 0 ? (
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        접속 이력이 없습니다
                      </TableCell>
                  ) : (
                    auditLogs?.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge
                            variant={
                              log.action === "impersonation_started"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {log.action === "impersonation_started"
                              ? "세션 시작"
                              : "세션 종료"}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.actor_user_id}</TableCell>
                        <TableCell>{log.tenant_id || "N/A"}</TableCell>
                        <TableCell className="max-w-xs">
                          <code className="text-xs">
                            {JSON.stringify(log.metadata).substring(0, 50)}...
                          </code>
                        </TableCell>
                        <TableCell>
                          {new Date(log.created_at).toLocaleString("ko-KR")}
                        </TableCell>
                        <TableCell>
                          {log.ip_address || "N/A"}
                        </TableCell>
                      </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
      </div>
    </OperatorLayout>
  );
}
