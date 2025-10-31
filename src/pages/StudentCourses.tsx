import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { BookOpen, Clock, PlayCircle, CheckCircle2 } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  level: string;
  duration_hours: number;
}

interface Enrollment {
  id: string;
  course_id: string;
  progress: number;
  courses: Course;
  calculated_progress?: number;
}

const StudentCourses = () => {
  const [searchParams] = useSearchParams();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"student" | "teacher" | "admin">("student");

  // Check if in demo mode
  const demoRole = searchParams.get('role') as "student" | "teacher" | "admin" | null;
  const isDemo = !!demoRole;

  useEffect(() => {
    if (isDemo) {
      // Demo mode: use role from URL param
      setUserRole(demoRole);
      setLoading(false);
    } else {
      // Real mode: check user role
      checkUserRole();
      fetchEnrollments();
    }
  }, [isDemo, demoRole]);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (roles?.some(r => r.role === "admin")) {
        setUserRole("admin");
        // 관리자는 모든 강좌를 볼 수 있음
        fetchAllCourses();
      } else if (roles?.some(r => r.role === "teacher")) {
        setUserRole("teacher");
      }
    } catch (error) {
      console.error("Error checking user role:", error);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          id,
          course_id,
          progress,
          courses (
            id,
            title,
            description,
            thumbnail_url,
            level,
            duration_hours
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;

      // Fetch course contents to calculate total lessons per course
      const courseIds = data?.map(e => e.course_id) || [];
      const courseContentsResult = await supabase
        .from("course_contents")
        .select("course_id")
        .in("course_id", courseIds);

      if (courseContentsResult.error) throw courseContentsResult.error;

      // Create a map of course_id to total content count
      const courseContentCountMap = new Map<string, number>();
      courseContentsResult.data.forEach((content) => {
        const count = courseContentCountMap.get(content.course_id) || 0;
        courseContentCountMap.set(content.course_id, count + 1);
      });

      // Fetch content progress for the user
      const contentProgressResult = await supabase
        .from("content_progress")
        .select(`
          user_id,
          content_id,
          completed,
          course_contents(course_id)
        `)
        .eq("user_id", user.id);

      if (contentProgressResult.error) throw contentProgressResult.error;

      // Calculate progress for each enrollment
      const userCourseProgressMap = new Map<string, number>();
      
      contentProgressResult.data.forEach((cp: any) => {
        if (cp.completed && cp.course_contents?.course_id) {
          const key = cp.course_contents.course_id;
          const count = userCourseProgressMap.get(key) || 0;
          userCourseProgressMap.set(key, count + 1);
        }
      });

      // Combine enrollments with calculated progress
      const enrichedEnrollments = (data || []).map((enrollment: any) => {
        const completedCount = userCourseProgressMap.get(enrollment.course_id) || 0;
        const totalCount = courseContentCountMap.get(enrollment.course_id) || 1;
        const calculatedProgress = (completedCount / totalCount) * 100;

        return {
          ...enrollment,
          calculated_progress: calculatedProgress,
        };
      });

      setEnrollments(enrichedEnrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // 관리자용으로 enrollments 형식에 맞게 변환
      const adminEnrollments = (data || []).map(course => ({
        id: `admin-${course.id}`,
        course_id: course.id,
        progress: 0,
        courses: course,
      }));
      
      setEnrollments(adminEnrollments as any);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "beginner": return { text: "초급", variant: "default" as const };
      case "intermediate": return { text: "중급", variant: "secondary" as const };
      case "advanced": return { text: "고급", variant: "destructive" as const };
      default: return { text: level, variant: "outline" as const };
    }
  };

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            {userRole === "admin" ? "전체 강좌" : "내 강의"}
            <Badge variant="default" className="text-xs">AI</Badge>
          </h1>
          <p className="text-muted-foreground mt-2">
            {userRole === "admin" 
              ? "관리자 권한으로 모든 강좌에 접근할 수 있습니다" 
              : "수강 중인 강의를 확인하고 학습을 이어가세요"}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">강좌 정보를 불러오는 중...</p>
            </div>
          </div>
        ) : enrollments.length === 0 ? (
          <Card className="border-border/50 shadow-sm">
            <CardContent className="pt-12 pb-12 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">수강 중인 강좌가 없습니다</h3>
              <p className="text-muted-foreground mb-6">
                새로운 강좌를 시작해보세요
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 학습 진행 현황 */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {userRole === "admin" ? "전체 강좌" : "수강 중인 강의"}
                      </p>
                      <p className="text-3xl font-bold mt-2">{enrollments.length}</p>
                    </div>
                    <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        평균 진행률
                      </p>
                      <p className="text-3xl font-bold mt-2">
                        {enrollments.length > 0 
                          ? Math.round(enrollments.reduce((acc, e) => acc + (e.calculated_progress || e.progress || 0), 0) / enrollments.length)
                          : 0}%
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-accent/10 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        총 학습 시간
                      </p>
                      <p className="text-3xl font-bold mt-2">
                        {enrollments.reduce((acc, e) => acc + (e.courses?.duration_hours || 0), 0)}시간
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <Clock className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 수강 중인 강의 목록 */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                {userRole === "admin" ? "전체 강좌 목록" : "수강 중인 강의"}
                <Badge variant="default" className="text-xs">AI</Badge>
              </h2>
              <Card className="border-border/50 shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">제목</TableHead>
                      <TableHead>난이도</TableHead>
                      <TableHead>학습시간</TableHead>
                      {userRole !== "admin" && <TableHead>진행률</TableHead>}
                      <TableHead className="text-right">액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enrollment) => {
                      const course = enrollment.courses;
                      if (!course) return null;
                      
                      const levelBadge = getLevelBadge(course.level);
                      
                      return (
                        <TableRow key={enrollment.id} className="group">
                          <TableCell className="font-medium">
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <Link 
                                  to={`/student/courses/${course.id}`}
                                  className="hover:text-primary transition-colors"
                                >
                                  {course.title}
                                </Link>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-80" side="right">
                                <div className="space-y-2">
                                  {course.thumbnail_url ? (
                                    <img
                                      src={course.thumbnail_url}
                                      alt={course.title}
                                      className="w-full h-40 object-cover rounded-lg"
                                    />
                                  ) : (
                                    <div className="w-full h-40 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                                      <BookOpen className="h-12 w-12 text-primary/40" />
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="font-semibold">{course.title}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {course.description || "강좌 설명이 없습니다"}
                                    </p>
                                  </div>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          </TableCell>
                          <TableCell>
                            <Badge variant={levelBadge.variant}>
                              {levelBadge.text}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{course.duration_hours}시간</span>
                            </div>
                          </TableCell>
                          {userRole !== "admin" && (
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={enrollment.calculated_progress || enrollment.progress || 0} 
                                  className="h-2 w-24" 
                                />
                                <span className="text-sm font-medium min-w-[40px]">
                                  {Math.round(enrollment.calculated_progress || enrollment.progress || 0)}%
                                </span>
                              </div>
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            <Link to={`/student/courses/${course.id}`}>
                              <Button size="sm" className="gap-2">
                                <PlayCircle className="h-4 w-4" />
                                {userRole === "admin" ? "강좌 보기" : "학습하기"}
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentCourses;
