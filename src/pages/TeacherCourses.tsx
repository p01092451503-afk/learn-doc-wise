import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { BookOpen, Users, Star, ClipboardList, Eye, Calendar, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { AtomSpinner } from "@/components/AtomSpinner";

const TeacherCourses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 관리자가 매칭한 강의 조회 (instructor_id로 필터링)
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          categories(name)
        `)
        .eq("instructor_id", user.id)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // 각 강의의 통계를 개별적으로 계산
      const coursesWithStats = await Promise.all(
        (data || []).map(async (course: any) => {
          // 수강생 수 조회
          const { count: enrollmentCount } = await supabase
            .from("enrollments")
            .select("*", { count: "exact", head: true })
            .eq("course_id", course.id);

          // 평균 진행률 조회
          const { data: enrollments } = await supabase
            .from("enrollments")
            .select("progress")
            .eq("course_id", course.id);

          const avgProgress = enrollments && enrollments.length > 0
            ? Math.round(enrollments.reduce((sum: number, e: any) => sum + (e.progress || 0), 0) / enrollments.length)
            : 0;

          // 과제 수 조회
          const { count: assignmentCount } = await supabase
            .from("assignments")
            .select("*", { count: "exact", head: true })
            .eq("course_id", course.id);

          return {
            ...course,
            category_name: course.categories?.name || "미분류",
            students: enrollmentCount || 0,
            avg_progress: avgProgress,
            assignment_count: assignmentCount || 0,
          };
        })
      );

      setCourses(coursesWithStats);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "오류",
        description: "담당 강의 목록을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      // 에러가 발생해도 빈 배열로 설정하여 UI가 정상 표시되도록
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudents = (courseId: string) => {
    navigate(`/teacher/students?course=${courseId}`);
  };

  const handleViewAssignments = (courseId: string) => {
    navigate(`/teacher/assignments?course=${courseId}`);
  };

  const handleViewAttendance = (courseId: string) => {
    navigate(`/teacher/attendance?course=${courseId}`);
  };

  const handleViewAnalytics = (courseId: string) => {
    navigate(`/teacher/analytics?course=${courseId}`);
  };

  if (loading) {
    return (
      <DashboardLayout userRole="teacher">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AtomSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">담당 강의 목록을 불러오는 중...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalStudents = courses.reduce((sum, c) => sum + c.students, 0);
  const avgProgress = courses.length > 0
    ? Math.round(courses.reduce((sum, c) => sum + c.avg_progress, 0) / courses.length)
    : 0;

  return (
    <DashboardLayout userRole="teacher">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <BookOpen className="h-7 w-7 text-primary" />
              담당 강의
            </h1>
            <p className="text-muted-foreground">
              관리자가 배정한 강의의 학생들을 관리하세요
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title="담당 강의"
            value={courses.length.toString()}
            icon={<BookOpen className="h-4 w-4" />}
            description="배정된 강의 수"
          />
          <StatsCard
            title="총 수강생"
            value={totalStudents.toString()}
            icon={<Users className="h-4 w-4" />}
            description="전체 수강생"
          />
          <StatsCard
            title="평균 진행률"
            value={`${avgProgress}%`}
            icon={<BarChart3 className="h-4 w-4" />}
            description="학습 진행률"
          />
          <StatsCard
            title="과제"
            value={courses.reduce((sum, c) => sum + c.assignment_count, 0).toString()}
            icon={<ClipboardList className="h-4 w-4" />}
            description="등록된 과제"
          />
        </div>

        {/* Courses Table */}
        <Card>
          <CardHeader>
            <CardTitle>담당 강의 목록</CardTitle>
            <CardDescription>
              {courses.length > 0 
                ? "각 강의를 클릭하여 학생 관리, 과제 확인, 출석 등을 진행하세요" 
                : "아직 배정된 강의가 없습니다. 관리자가 강의를 배정하면 여기에 표시됩니다."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">배정된 강의가 없습니다</h3>
                <p className="text-sm text-muted-foreground">
                  관리자가 강의를 배정하면 이곳에서 학생들을 관리할 수 있습니다.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>강의명</TableHead>
                    <TableHead>분류</TableHead>
                    <TableHead className="text-center">수강생</TableHead>
                    <TableHead className="text-center">평균 진행률</TableHead>
                    <TableHead className="text-center">과제</TableHead>
                    <TableHead className="text-right">학생 관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-xs text-muted-foreground">{course.category_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{course.level === 'beginner' ? '초급' : course.level === 'intermediate' ? '중급' : '고급'}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {course.students}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${course.avg_progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{course.avg_progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{course.assignment_count}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleViewStudents(course.id)} 
                            title="학생 관리"
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleViewAssignments(course.id)} 
                            title="과제 관리"
                          >
                            <ClipboardList className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleViewAttendance(course.id)} 
                            title="출석 관리"
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleViewAnalytics(course.id)} 
                            title="학습 분석"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  description 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  description: string; 
}) => (
  <Card className="overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium whitespace-nowrap">{title}</CardTitle>
      <div className="text-muted-foreground flex-shrink-0">{icon}</div>
    </CardHeader>
    <CardContent className="space-y-1 min-w-0">
      <div className="text-xl font-bold break-all">{value}</div>
      <p className="text-xs text-muted-foreground whitespace-nowrap">{description}</p>
    </CardContent>
  </Card>
);

export default TeacherCourses;
