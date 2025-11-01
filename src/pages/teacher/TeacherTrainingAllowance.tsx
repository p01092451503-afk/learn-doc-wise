import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { 
  DollarSign, 
  Download,
  Calendar as CalendarIcon,
  Users,
  TrendingUp
} from "lucide-react";
import atomLogo from "@/assets/atom-logo.png";

interface Course {
  id: string;
  title: string;
}

interface StudentAllowance {
  student_id: string;
  student_name: string;
  student_email: string;
  total_attendance_days: number;
  daily_allowance: number;
  total_allowance: number;
  is_eligible: boolean;
}

const TeacherTrainingAllowance = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [students, setStudents] = useState<StudentAllowance[]>([]);
  const [loading, setLoading] = useState(false);
  const [dailyAllowance, setDailyAllowance] = useState<number>(10000);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [stats, setStats] = useState({
    totalStudents: 0,
    eligibleStudents: 0,
    totalAmount: 0,
    averageAllowance: 0,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchAllowanceData();
    }
  }, [selectedCourse, selectedYear, selectedMonth, dailyAllowance]);

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

  const fetchAllowanceData = async () => {
    if (!selectedCourse) return;

    try {
      setLoading(true);

      // 선택한 월의 시작일과 종료일 계산
      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      const endDate = new Date(selectedYear, selectedMonth, 0);

      // 해당 강의의 수강생 목록 가져오기
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

      // 각 학생의 출석일수와 훈련수당 계산
      const studentData: StudentAllowance[] = await Promise.all(
        (enrollments || []).map(async (enrollment: any) => {
          const userId = enrollment.user_id;
          
          // 해당 월의 출석 데이터 가져오기
          const { data: attendanceData } = await supabase
            .from("attendance")
            .select("status, attendance_date")
            .eq("course_id", selectedCourse)
            .eq("user_id", userId)
            .gte("attendance_date", format(startDate, "yyyy-MM-dd"))
            .lte("attendance_date", format(endDate, "yyyy-MM-dd"));

          // 출석일수 계산 (출석, 지각만 인정)
          const attendanceDays = attendanceData?.filter(
            (a) => a.status === "present" || a.status === "late"
          ).length || 0;

          // 훈련수당 계산
          const totalAllowance = attendanceDays * dailyAllowance;

          // 지급 대상 여부 (최소 1일 이상 출석)
          const isEligible = attendanceDays > 0;

          return {
            student_id: userId,
            student_name: enrollment.profiles?.full_name || "이름 없음",
            student_email: "",
            total_attendance_days: attendanceDays,
            daily_allowance: dailyAllowance,
            total_allowance: totalAllowance,
            is_eligible: isEligible,
          };
        })
      );

      setStudents(studentData);

      // 통계 계산
      const eligibleStudents = studentData.filter((s) => s.is_eligible);
      const totalAmount = eligibleStudents.reduce((sum, s) => sum + s.total_allowance, 0);
      const averageAllowance = eligibleStudents.length > 0 
        ? totalAmount / eligibleStudents.length 
        : 0;

      setStats({
        totalStudents: studentData.length,
        eligibleStudents: eligibleStudents.length,
        totalAmount: totalAmount,
        averageAllowance: Math.round(averageAllowance),
      });

    } catch (error: any) {
      toast({
        title: "훈련수당 데이터 로딩 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <DashboardLayout userRole="teacher">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <img src={atomLogo} alt="atom" className="h-8 w-8" />
              훈련수당 관리
            </h1>
            <p className="text-muted-foreground mt-2">
              출석일 기반으로 학생들의 훈련수당을 자동 계산합니다
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            엑셀 다운로드
          </Button>
        </div>

        {/* 설정 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>설정</CardTitle>
            <CardDescription>강의와 기간, 일일 훈련수당을 설정하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>강의 선택</Label>
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
              </div>

              <div className="space-y-2">
                <Label>년도</Label>
                <Select 
                  value={selectedYear.toString()} 
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}년
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>월</Label>
                <Select 
                  value={selectedMonth.toString()} 
                  onValueChange={(value) => setSelectedMonth(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        {month}월
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>일일 훈련수당</Label>
                <Input
                  type="number"
                  value={dailyAllowance}
                  onChange={(e) => setDailyAllowance(parseInt(e.target.value) || 0)}
                  min="0"
                  step="1000"
                />
              </div>
            </div>
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
                    <div className="text-2xl font-bold">{stats.totalStudents}명</div>
                  </div>
                </CardContent>
              </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
                      지급 대상
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {stats.eligibleStudents}명
                      </div>
                    </div>
                  </CardContent>
                </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-primary">
                    총 지급액
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(stats.totalAmount)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    평균 지급액
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <div className="text-2xl font-bold">
                      {formatCurrency(stats.averageAllowance)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 학생별 훈련수당 목록 */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedYear}년 {selectedMonth}월 훈련수당 내역
                </CardTitle>
                <CardDescription>
                  출석일수 × 일일 훈련수당({formatCurrency(dailyAllowance)})
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">로딩 중...</p>
                ) : students.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    데이터가 없습니다
                  </p>
                ) : (
                  <div className="space-y-3">
                    {students.map((student) => (
                      <Card key={student.student_id}>
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{student.student_name}</h4>
                                  {student.is_eligible ? (
                                    <Badge className="bg-green-500 hover:bg-green-600">지급 대상</Badge>
                                  ) : (
                                    <Badge variant="outline">미지급</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {student.student_email}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary">
                                  {formatCurrency(student.total_allowance)}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {student.total_attendance_days}일 출석
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t">
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">출석일수</p>
                                  <p className="font-semibold">{student.total_attendance_days}일</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">일일 수당</p>
                                  <p className="font-semibold">{formatCurrency(student.daily_allowance)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">지급액</p>
                                  <p className="font-semibold text-primary">
                                    {formatCurrency(student.total_allowance)}
                                  </p>
                                </div>
                              </div>
                            </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherTrainingAllowance;
