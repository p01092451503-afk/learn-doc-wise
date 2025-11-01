import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Download,
  Users,
  TrendingUp,
  AlertTriangle,
  Award,
  Calendar,
  BarChart3
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import atomLogo from "@/assets/atom-logo.png";

interface Course {
  id: string;
  title: string;
}

interface ReportData {
  totalStudents: number;
  activeStudents: number;
  droppedStudents: number;
  averageAttendanceRate: number;
  averageGrade: number;
  completionRate: number;
  satisfactionScore: number;
  atRiskCount: number;
  gradeDistribution: {
    excellent: number;  // 90점 이상
    good: number;       // 80-89점
    average: number;    // 70-79점
    pass: number;       // 60-69점
    fail: number;       // 60점 미만
  };
}

const TeacherTrainingReport = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchReportData();
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

  const fetchReportData = async () => {
    if (!selectedCourse) return;

    try {
      setLoading(true);

      // 1. 수강생 정보
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("user_id, progress, completed_at")
        .eq("course_id", selectedCourse);

      const totalStudents = enrollments?.length || 0;
      const completedStudents = enrollments?.filter(e => e.completed_at).length || 0;
      const activeStudents = enrollments?.filter(e => !e.completed_at).length || 0;

      // 2. 중도탈락자
      const { data: dropouts } = await supabase
        .from("dropout_records")
        .select(`
          enrollment_id,
          enrollments!inner(course_id)
        `)
        .eq("enrollments.course_id", selectedCourse);

      const droppedStudents = dropouts?.length || 0;

      // 3. 출석률 계산
      let totalAttendanceRate = 0;
      if (enrollments && enrollments.length > 0) {
        const attendanceRates = await Promise.all(
          enrollments.map(async (enrollment) => {
            const { data: attendanceData } = await supabase
              .from("attendance")
              .select("status")
              .eq("course_id", selectedCourse)
              .eq("user_id", enrollment.user_id);

            const total = attendanceData?.length || 0;
            const present = attendanceData?.filter(
              a => a.status === "present" || a.status === "late"
            ).length || 0;

            return total > 0 ? (present / total) * 100 : 0;
          })
        );

        totalAttendanceRate = attendanceRates.reduce((sum, rate) => sum + rate, 0) / enrollments.length;
      }

      // 4. 평균 성적 및 분포
      let averageGrade = 0;
      let gradeDistribution = {
        excellent: 0,
        good: 0,
        average: 0,
        pass: 0,
        fail: 0
      };

      if (enrollments && enrollments.length > 0) {
        const grades = await Promise.all(
          enrollments.map(async (enrollment) => {
            const { data: gradesData } = await supabase
              .from("grades")
              .select("score, max_score")
              .eq("enrollment_id", enrollment.user_id);

            if (!gradesData || gradesData.length === 0) return 0;

            const totalPercentage = gradesData.reduce((sum, grade) => {
              return sum + (grade.score / grade.max_score) * 100;
            }, 0);

            return totalPercentage / gradesData.length;
          })
        );

        averageGrade = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;

        // 성적 분포 계산
        grades.forEach(grade => {
          if (grade >= 90) gradeDistribution.excellent++;
          else if (grade >= 80) gradeDistribution.good++;
          else if (grade >= 70) gradeDistribution.average++;
          else if (grade >= 60) gradeDistribution.pass++;
          else gradeDistribution.fail++;
        });
      }

      // 5. 만족도 조사 결과 (임시로 0으로 설정)
      let satisfactionScore = 0;

      // 6. 위험군 학생 수 (출석률 80% 미만 또는 평균 성적 60점 미만)
      let atRiskCount = 0;
      if (enrollments && enrollments.length > 0) {
        const riskAnalysis = await Promise.all(
          enrollments.map(async (enrollment, index) => {
            const { data: attendanceData } = await supabase
              .from("attendance")
              .select("status")
              .eq("course_id", selectedCourse)
              .eq("user_id", enrollment.user_id);

            const total = attendanceData?.length || 0;
            const present = attendanceData?.filter(
              a => a.status === "present" || a.status === "late"
            ).length || 0;

            const attendanceRate = total > 0 ? (present / total) * 100 : 0;
            
            // grades 배열에서 인덱스로 접근
            const { data: gradesData } = await supabase
              .from("grades")
              .select("score, max_score")
              .eq("enrollment_id", enrollment.user_id);

            let grade = 0;
            if (gradesData && gradesData.length > 0) {
              const totalPercentage = gradesData.reduce((sum, g) => {
                return sum + (g.score / g.max_score) * 100;
              }, 0);
              grade = totalPercentage / gradesData.length;
            }

            return attendanceRate < 80 || grade < 60;
          })
        );

        atRiskCount = riskAnalysis.filter(Boolean).length;
      }

      setReportData({
        totalStudents,
        activeStudents,
        droppedStudents,
        averageAttendanceRate: Math.round(totalAttendanceRate * 10) / 10,
        averageGrade: Math.round(averageGrade * 10) / 10,
        completionRate: totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 1000) / 10 : 0,
        satisfactionScore: Math.round(satisfactionScore * 10) / 10,
        atRiskCount,
        gradeDistribution
      });

    } catch (error: any) {
      toast({
        title: "리포트 데이터 로딩 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getGradeLabel = (key: string) => {
    const labels: Record<string, string> = {
      excellent: "우수 (90점 이상)",
      good: "양호 (80-89점)",
      average: "보통 (70-79점)",
      pass: "합격 (60-69점)",
      fail: "불합격 (60점 미만)"
    };
    return labels[key] || key;
  };

  return (
    <DashboardLayout userRole="teacher">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <img src={atomLogo} alt="atom" className="h-8 w-8" />
              훈련 진행 리포트
            </h1>
            <p className="text-muted-foreground mt-2">
              과정별 진행 현황을 종합적으로 확인하고 리포트를 생성합니다
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            PDF 다운로드
          </Button>
        </div>

        {/* 강의 선택 */}
        <Card>
          <CardHeader>
            <CardTitle>강의 선택</CardTitle>
            <CardDescription>리포트를 확인할 강의를 선택하세요</CardDescription>
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

        {/* 리포트 내용 */}
        {selectedCourse && reportData && !loading && (
          <>
            {/* 주요 지표 */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    전체 훈련생
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.totalStudents}명</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    활동중: {reportData.activeStudents}명 / 중도탈락: {reportData.droppedStudents}명
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    평균 출석률
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {reportData.averageAttendanceRate}%
                  </div>
                  <Progress value={reportData.averageAttendanceRate} className="mt-2 h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    평균 성적
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {reportData.averageGrade}점
                  </div>
                  <Progress value={reportData.averageGrade} className="mt-2 h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    위험군 학생
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {reportData.atRiskCount}명
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    출석률 80% 미만 또는 성적 60점 미만
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 상세 통계 */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* 성적 분포 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    성적 분포
                  </CardTitle>
                  <CardDescription>학생들의 성적 분포 현황</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(reportData.gradeDistribution).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{getGradeLabel(key)}</span>
                        <span className="text-sm font-bold">{value}명</span>
                      </div>
                      <Progress 
                        value={reportData.totalStudents > 0 ? (value / reportData.totalStudents) * 100 : 0} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 과정 진행률 & 만족도 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    과정 진행 현황
                  </CardTitle>
                  <CardDescription>전반적인 과정 진행 상태</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">수료율</span>
                      <span className="text-2xl font-bold text-primary">
                        {reportData.completionRate}%
                      </span>
                    </div>
                    <Progress value={reportData.completionRate} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-1">
                      전체 학생 중 수료 완료한 비율
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">만족도 점수</span>
                      <span className="text-2xl font-bold text-green-600">
                        {reportData.satisfactionScore.toFixed(1)} / 5.0
                      </span>
                    </div>
                    <Progress value={(reportData.satisfactionScore / 5) * 100} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-1">
                      만족도 조사 평균 점수
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">활동 학생</span>
                        <span className="font-medium">{reportData.activeStudents}명</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">중도탈락</span>
                        <span className="font-medium text-red-600">{reportData.droppedStudents}명</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">위험군</span>
                        <span className="font-medium text-yellow-600">{reportData.atRiskCount}명</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 리포트 생성 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  리포트 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">생성일시</span>
                    <span className="font-medium">
                      {format(new Date(), "yyyy년 MM월 dd일 HH:mm", { locale: ko })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">리포트 유형</span>
                    <span className="font-medium">종합 훈련 진행 리포트</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">데이터 기준일</span>
                    <span className="font-medium">
                      {format(new Date(), "yyyy년 MM월 dd일", { locale: ko })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {loading && (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">리포트 생성 중...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherTrainingReport;
