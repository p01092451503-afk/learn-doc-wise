import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Download,
  TrendingUp,
  TrendingDown,
  Users
} from "lucide-react";

interface Course {
  id: string;
  title: string;
}

interface StudentCompletion {
  student_id: string;
  student_name: string;
  student_email: string;
  attendance_rate: number;
  average_score: number;
  meets_attendance: boolean;
  meets_grade: boolean;
  can_complete: boolean;
  status: "예상 수료" | "수료 위험" | "수료 불가";
}

const TeacherTrainingCompletion = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [students, setStudents] = useState<StudentCompletion[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    canComplete: 0,
    atRisk: 0,
    cannotComplete: 0,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchCompletionData();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .eq("instructor_id", user.id)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
      
      if (data && data.length > 0) {
        setSelectedCourse(data[0].id);
      }
    } catch (error: any) {
      toast({
        title: "강의 목록 로딩 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchCompletionData = async () => {
    if (!selectedCourse) return;

    try {
      setLoading(true);

      // 1. 해당 강의의 수강생 목록 가져오기
      const { data: enrollments, error: enrollmentError } = await supabase
        .from("enrollments")
        .select(`
          id,
          user_id,
          profiles:user_id (
            full_name
          )
        `)
        .eq("course_id", selectedCourse);

      if (enrollmentError) throw enrollmentError;

      // 2. 각 학생의 출석률과 성적 계산
      const studentData: StudentCompletion[] = await Promise.all(
        (enrollments || []).map(async (enrollment: any) => {
          const userId = enrollment.user_id;
          const enrollmentId = enrollment.id;
          
          // 출석률 계산
          const { data: attendanceData } = await supabase
            .from("attendance")
            .select("status")
            .eq("course_id", selectedCourse)
            .eq("user_id", userId);

          const totalAttendance = attendanceData?.length || 0;
          const presentCount = attendanceData?.filter(
            (a) => a.status === "present" || a.status === "late"
          ).length || 0;
          const attendanceRate = totalAttendance > 0 
            ? (presentCount / totalAttendance) * 100 
            : 0;

          // 평균 성적 계산
          const { data: gradesData } = await supabase
            .from("grades")
            .select("score, max_score")
            .eq("enrollment_id", enrollmentId);

          let averageScore = 0;
          if (gradesData && gradesData.length > 0) {
            const totalPercentage = gradesData.reduce((sum, grade) => {
              return sum + (grade.score / grade.max_score) * 100;
            }, 0);
            averageScore = totalPercentage / gradesData.length;
          }

          // 수료 요건 체크
          const meetsAttendance = attendanceRate >= 80;
          const meetsGrade = averageScore >= 60;
          const canComplete = meetsAttendance && meetsGrade;

          let status: "예상 수료" | "수료 위험" | "수료 불가";
          if (canComplete) {
            status = "예상 수료";
          } else if (meetsAttendance || meetsGrade) {
            status = "수료 위험";
          } else {
            status = "수료 불가";
          }

          return {
            student_id: userId,
            student_name: enrollment.profiles?.full_name || "이름 없음",
            student_email: "",
            attendance_rate: Math.round(attendanceRate * 10) / 10,
            average_score: Math.round(averageScore * 10) / 10,
            meets_attendance: meetsAttendance,
            meets_grade: meetsGrade,
            can_complete: canComplete,
            status,
          };
        })
      );

      setStudents(studentData);

      // 통계 계산
      setStats({
        total: studentData.length,
        canComplete: studentData.filter((s) => s.can_complete).length,
        atRisk: studentData.filter((s) => s.status === "수료 위험").length,
        cannotComplete: studentData.filter((s) => s.status === "수료 불가").length,
      });

    } catch (error: any) {
      toast({
        title: "수료 데이터 로딩 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "예상 수료":
        return <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />예상 수료</Badge>;
      case "수료 위험":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600 dark:text-yellow-400 dark:border-yellow-400 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />수료 위험</Badge>;
      case "수료 불가":
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" />수료 불가</Badge>;
      default:
        return null;
    }
  };

  const filteredStudents = (filter: string) => {
    switch (filter) {
      case "can-complete":
        return students.filter((s) => s.can_complete);
      case "at-risk":
        return students.filter((s) => s.status === "수료 위험");
      case "cannot-complete":
        return students.filter((s) => s.status === "수료 불가");
      default:
        return students;
    }
  };

  return (
    <DashboardLayout userRole="teacher">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">수료 요건 관리</h1>
            <p className="text-muted-foreground mt-2">
              학생들의 출석률과 성적을 기반으로 수료 요건을 자동으로 체크합니다
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            엑셀 다운로드
          </Button>
        </div>

        {/* 강의 선택 */}
        <Card>
          <CardHeader>
            <CardTitle>강의 선택</CardTitle>
            <CardDescription>수료 요건을 확인할 강의를 선택하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="강의를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* 통계 카드 */}
        {selectedCourse && (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    전체 학생
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div className="text-2xl font-bold">{stats.total}명</div>
                  </div>
                </CardContent>
              </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
                      예상 수료
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {stats.canComplete}명
                      </div>
                    </div>
                    <Progress 
                      value={stats.total > 0 ? (stats.canComplete / stats.total) * 100 : 0} 
                      className="mt-2 h-2" 
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                      수료 위험
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {stats.atRisk}명
                      </div>
                    </div>
                    <Progress 
                      value={stats.total > 0 ? (stats.atRisk / stats.total) * 100 : 0} 
                      className="mt-2 h-2" 
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">
                      수료 불가
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {stats.cannotComplete}명
                      </div>
                    </div>
                    <Progress 
                      value={stats.total > 0 ? (stats.cannotComplete / stats.total) * 100 : 0} 
                      className="mt-2 h-2" 
                    />
                  </CardContent>
                </Card>
            </div>

            {/* 학생 목록 탭 */}
            <Card>
              <CardHeader>
                <CardTitle>수료 현황</CardTitle>
                <CardDescription>
                  출석률 80% 이상, 평균 성적 60점 이상이 수료 요건입니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">전체 ({stats.total})</TabsTrigger>
                    <TabsTrigger value="can-complete">예상 수료 ({stats.canComplete})</TabsTrigger>
                    <TabsTrigger value="at-risk">수료 위험 ({stats.atRisk})</TabsTrigger>
                    <TabsTrigger value="cannot-complete">수료 불가 ({stats.cannotComplete})</TabsTrigger>
                  </TabsList>

                  {["all", "can-complete", "at-risk", "cannot-complete"].map((filter) => (
                    <TabsContent key={filter} value={filter} className="space-y-4">
                      {loading ? (
                        <p className="text-center text-muted-foreground py-8">로딩 중...</p>
                      ) : filteredStudents(filter).length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          해당하는 학생이 없습니다
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {filteredStudents(filter).map((student) => (
                            <Card key={student.student_id}>
                              <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold">{student.student_name}</h4>
                                      {getStatusBadge(student.status)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {student.student_email}
                                    </p>
                                  </div>
                                  <Award className={`h-6 w-6 ${student.can_complete ? "text-green-500" : "text-muted-foreground/30"}`} />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-medium">출석률</span>
                                      <span className={`text-sm font-bold ${student.meets_attendance ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                        {student.attendance_rate}%
                                      </span>
                                    </div>
                                    <Progress 
                                      value={student.attendance_rate} 
                                      className="h-2"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {student.meets_attendance ? "✓ 요건 충족" : "✗ 80% 미만"}
                                    </p>
                                  </div>

                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-medium">평균 성적</span>
                                      <span className={`text-sm font-bold ${student.meets_grade ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                        {student.average_score}점
                                      </span>
                                    </div>
                                    <Progress 
                                      value={student.average_score} 
                                      className="h-2"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {student.meets_grade ? "✓ 요건 충족" : "✗ 60점 미만"}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherTrainingCompletion;
