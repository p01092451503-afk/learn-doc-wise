import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Send,
  AlertTriangle,
  CheckCircle,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface StudentEngagement {
  user_id: string;
  full_name: string;
  enrollment_count: number;
  avg_progress: number;
  last_activity: string;
  days_inactive: number;
  completed_lessons: number;
  pending_assignments: number;
  risk_level: "low" | "medium" | "high" | "critical";
}

const TeacherEngagementMonitoring = () => {
  const [students, setStudents] = useState<StudentEngagement[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<StudentEngagement | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchStudentEngagement();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, riskFilter]);

  const fetchStudentEngagement = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 강사의 강의를 수강하는 학생들 조회
      const { data: enrollmentData, error } = await supabase
        .from("enrollments")
        .select(`
          user_id,
          progress,
          enrolled_at,
          courses!inner(instructor_id)
        `)
        .eq("courses.instructor_id", user.id);

      if (error) throw error;

      // 각 학생별로 참여도 데이터 집계
      const studentMap = new Map<string, any>();

      for (const enrollment of enrollmentData || []) {
        const userId = enrollment.user_id;
        
        // 사용자 정보 가져오기
        if (!studentMap.has(userId)) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", userId)
            .single();
          
          studentMap.set(userId, {
            user_id: userId,
            full_name: profile?.full_name || "Unknown",
            enrollment_count: 0,
            total_progress: 0,
            last_activity: null,
            completed_lessons: 0,
            pending_assignments: 0,
          });
        }

        const student = studentMap.get(userId);
        student.enrollment_count++;
        student.total_progress += enrollment.progress || 0;
      }

      // 추가 데이터 조회 (마지막 활동, 완료 레슨, 미완료 과제)
      const studentList: StudentEngagement[] = [];
      
      for (const [userId, data] of studentMap) {
        // 마지막 활동 시간
        const { data: lastActivity } = await supabase
          .from("content_progress")
          .select("last_accessed_at")
          .eq("user_id", userId)
          .order("last_accessed_at", { ascending: false })
          .limit(1)
          .single();

        // 완료한 레슨 수
        const { count: completedCount } = await supabase
          .from("content_progress")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("completed", true);

        // 미완료 과제 수
        const { count: pendingCount } = await supabase
          .from("assignment_submissions")
          .select("*", { count: "exact", head: true })
          .eq("student_id", userId)
          .eq("status", "submitted");

        const lastActivityDate = lastActivity?.last_accessed_at
          ? new Date(lastActivity.last_accessed_at)
          : new Date(data.enrolled_at);
        
        const daysInactive = Math.floor(
          (Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        const avgProgress = data.total_progress / data.enrollment_count;

        // 위험도 계산
        let riskLevel: StudentEngagement["risk_level"] = "low";
        if (daysInactive > 14 || avgProgress < 20) {
          riskLevel = "critical";
        } else if (daysInactive > 7 || avgProgress < 40) {
          riskLevel = "high";
        } else if (daysInactive > 3 || avgProgress < 60) {
          riskLevel = "medium";
        }

        studentList.push({
          user_id: userId,
          full_name: data.full_name,
          enrollment_count: data.enrollment_count,
          avg_progress: avgProgress,
          last_activity: lastActivityDate.toISOString(),
          days_inactive: daysInactive,
          completed_lessons: completedCount || 0,
          pending_assignments: pendingCount || 0,
          risk_level: riskLevel,
        });
      }

      // 위험도 순으로 정렬
      studentList.sort((a, b) => {
        const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return riskOrder[a.risk_level] - riskOrder[b.risk_level];
      });

      setStudents(studentList);
    } catch (error) {
      console.error("Error fetching student engagement:", error);
      toast({
        title: "오류",
        description: "학생 참여도 데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter((s) =>
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (riskFilter !== "all") {
      filtered = filtered.filter((s) => s.risk_level === riskFilter);
    }

    setFilteredStudents(filtered);
  };

  const getRiskBadge = (level: string) => {
    const config = {
      critical: { label: "위험", variant: "destructive" as const },
      high: { label: "주의", variant: "default" as const },
      medium: { label: "보통", variant: "secondary" as const },
      low: { label: "양호", variant: "outline" as const },
    };
    return config[level as keyof typeof config] || config.low;
  };

  const handleSendMessage = async () => {
    if (!selectedStudent || !encouragementMessage.trim()) return;

    try {
      // 사용자의 tenant_id 가져오기
      const { data: userData } = await supabase
        .from("user_roles")
        .select("tenant_id")
        .eq("user_id", selectedStudent.user_id)
        .limit(1)
        .single();

      // 알림 생성
      const { error } = await supabase
        .from("notifications")
        .insert({
          user_id: selectedStudent.user_id,
          tenant_id: userData?.tenant_id,
          title: "강사님의 격려 메시지",
          message: encouragementMessage,
          type: "encouragement",
          priority: "normal",
        });

      if (error) throw error;

      toast({
        title: "전송 완료",
        description: `${selectedStudent.full_name}님에게 메시지를 전송했습니다.`,
      });

      setMessageDialogOpen(false);
      setEncouragementMessage("");
      setSelectedStudent(null);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "오류",
        description: "메시지 전송 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="teacher">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">학생 참여도 데이터를 불러오는 중...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="teacher">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Activity className="h-7 w-7 text-primary" />
            학습 참여도 모니터링
          </h1>
          <p className="text-muted-foreground">
            학생들의 학습 진도와 참여도를 실시간으로 확인하고 관리하세요
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 학생</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">위험</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {students.filter((s) => s.risk_level === "critical").length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">주의</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {students.filter((s) => s.risk_level === "high").length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">양호</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {students.filter((s) => s.risk_level === "low").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>학생 목록</CardTitle>
            <CardDescription>학생별 참여도 현황 및 개별 독려 메시지 전송</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="학생 이름 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="위험도 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="critical">위험</SelectItem>
                  <SelectItem value="high">주의</SelectItem>
                  <SelectItem value="medium">보통</SelectItem>
                  <SelectItem value="low">양호</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>학생명</TableHead>
                  <TableHead className="text-center">수강 강의</TableHead>
                  <TableHead className="text-center">평균 진도율</TableHead>
                  <TableHead className="text-center">완료 레슨</TableHead>
                  <TableHead className="text-center">미완료 과제</TableHead>
                  <TableHead className="text-center">마지막 활동</TableHead>
                  <TableHead className="text-center">위험도</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const riskConfig = getRiskBadge(student.risk_level);
                  return (
                    <TableRow key={student.user_id}>
                      <TableCell className="font-medium">{student.full_name}</TableCell>
                      <TableCell className="text-center">{student.enrollment_count}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${student.avg_progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {student.avg_progress.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{student.completed_lessons}</TableCell>
                      <TableCell className="text-center">{student.pending_assignments}</TableCell>
                      <TableCell className="text-center">
                        <div className="text-sm">
                          {format(new Date(student.last_activity), "MM/dd", { locale: ko })}
                          <span className="block text-xs text-muted-foreground">
                            ({student.days_inactive}일 전)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={riskConfig.variant}>{riskConfig.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog
                          open={messageDialogOpen && selectedStudent?.user_id === student.user_id}
                          onOpenChange={(open) => {
                            setMessageDialogOpen(open);
                            if (open) setSelectedStudent(student);
                            else setSelectedStudent(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="gap-2">
                              <MessageSquare className="h-4 w-4" />
                              독려
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>독려 메시지 전송</DialogTitle>
                              <DialogDescription>
                                {student.full_name}님에게 맞춤형 독려 메시지를 전송하세요
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="독려 메시지를 입력하세요..."
                                value={encouragementMessage}
                                onChange={(e) => setEncouragementMessage(e.target.value)}
                                rows={6}
                              />
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setMessageDialogOpen(false);
                                  setEncouragementMessage("");
                                }}
                              >
                                취소
                              </Button>
                              <Button onClick={handleSendMessage} className="gap-2">
                                <Send className="h-4 w-4" />
                                전송
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeacherEngagementMonitoring;
