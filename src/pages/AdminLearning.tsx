import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, TrendingUp, TrendingDown, AlertTriangle, BookOpen, Award, BarChart3, Brain, Search } from "lucide-react";

interface Enrollment {
  id: string;
  progress: number;
  enrolled_at: string;
  completed_at: string | null;
  user_id: string;
  course_id: string;
  courses: {
    title: string;
    id: string;
  };
  profiles: {
    full_name: string | null;
  };
  calculated_progress?: number;
}

interface LearningAnalytics {
  id: string;
  user_id: string;
  course_id: string;
  total_time_minutes: number;
  lessons_completed: number;
  engagement_score: number | null;
  at_risk_score: number | null;
  last_activity_at: string | null;
}

const AdminLearning = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [analytics, setAnalytics] = useState<LearningAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch enrollments with courses
      const enrollmentsResult = await supabase
        .from("enrollments")
        .select(`
          *,
          courses(id, title)
        `)
        .order("enrolled_at", { ascending: false })
        .limit(100);

      if (enrollmentsResult.error) throw enrollmentsResult.error;

      // Fetch profiles separately
      const userIds = [...new Set(enrollmentsResult.data.map((e: any) => e.user_id))];
      const profilesResult = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      if (profilesResult.error) throw profilesResult.error;

      // Create a map of user_id to profile
      const profilesMap = new Map(
        profilesResult.data.map((p) => [p.user_id, p])
      );

      // Fetch all course contents to calculate total lessons per course
      const courseIds = [...new Set(enrollmentsResult.data.map((e: any) => e.course_id))];
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

      // Fetch content progress for all users
      const contentProgressResult = await supabase
        .from("content_progress")
        .select(`
          user_id,
          content_id,
          completed,
          course_contents(course_id)
        `)
        .in("user_id", userIds);

      if (contentProgressResult.error) throw contentProgressResult.error;

      // Calculate progress for each enrollment
      const userCourseProgressMap = new Map<string, number>();
      
      contentProgressResult.data.forEach((cp: any) => {
        if (cp.completed && cp.course_contents?.course_id) {
          const key = `${cp.user_id}_${cp.course_contents.course_id}`;
          const count = userCourseProgressMap.get(key) || 0;
          userCourseProgressMap.set(key, count + 1);
        }
      });

      // Combine enrollments with profiles and calculated progress
      const enrichedEnrollments = enrollmentsResult.data.map((enrollment: any) => {
        const key = `${enrollment.user_id}_${enrollment.course_id}`;
        const completedCount = userCourseProgressMap.get(key) || 0;
        const totalCount = courseContentCountMap.get(enrollment.course_id) || 1;
        const calculatedProgress = (completedCount / totalCount) * 100;

        return {
          ...enrollment,
          profiles: profilesMap.get(enrollment.user_id),
          calculated_progress: calculatedProgress,
        };
      });

      // Fetch analytics
      const analyticsResult = await supabase
        .from("learning_analytics")
        .select("*")
        .order("last_activity_at", { ascending: false })
        .limit(100);

      if (analyticsResult.error) throw analyticsResult.error;

      setEnrollments(enrichedEnrollments as any || []);
      setAnalytics(analyticsResult.data || []);
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    toast({
      title: "리포트 다운로드",
      description: "리포트를 준비 중입니다...",
    });
    // CSV/XLSX export logic would go here
  };

  const getProgressBadge = (progress: number) => {
    if (progress >= 80) return <Badge className="bg-green-600">우수</Badge>;
    if (progress >= 50) return <Badge className="bg-blue-600">양호</Badge>;
    if (progress >= 20) return <Badge className="bg-yellow-600">보통</Badge>;
    return <Badge variant="destructive">저조</Badge>;
  };

  const getAtRiskBadge = (score: number | null) => {
    if (!score) return null;
    if (score >= 70) return <Badge variant="destructive">높음</Badge>;
    if (score >= 40) return <Badge className="bg-yellow-600">중간</Badge>;
    return <Badge className="bg-green-600">낮음</Badge>;
  };

  const completedEnrollments = enrollments.filter(e => e.completed_at);
  const avgProgress = enrollments.length > 0
    ? enrollments.reduce((sum, e) => sum + (e.calculated_progress || parseFloat(e.progress.toString())), 0) / enrollments.length
    : 0;
  const atRiskCount = analytics.filter(a => a.at_risk_score && a.at_risk_score >= 70).length;

  const filteredEnrollments = enrollments.filter(e =>
    e.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.courses?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">학습 관리</h1>
            <p className="text-muted-foreground mt-2">진도율, 성적, 학습 분석 및 이수 관리</p>
          </div>
          <Button onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            리포트 다운로드
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 수강생</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrollments.length}</div>
              <p className="text-xs text-muted-foreground mt-1">등록된 수강생</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">이수 완료</CardTitle>
              <Award className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedEnrollments.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {enrollments.length > 0
                  ? `${Math.round((completedEnrollments.length / enrollments.length) * 100)}% 완료율`
                  : "0% 완료율"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 진도율</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{Math.round(avgProgress)}%</div>
              <Progress value={avgProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">이탈 위험</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{atRiskCount}</div>
              <p className="text-xs text-muted-foreground mt-1">관심 필요</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="progress" className="space-y-4">
          <TabsList>
            <TabsTrigger value="progress">진도 현황</TabsTrigger>
            <TabsTrigger value="analytics">AI 학습 분석</TabsTrigger>
            <TabsTrigger value="completed">이수자 목록</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="학생 이름 또는 강좌명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>수강생 진도 현황</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>학생</TableHead>
                      <TableHead>강좌</TableHead>
                      <TableHead>진도율</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>수강 시작일</TableHead>
                      <TableHead>완료일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">
                          {enrollment.profiles?.full_name || "이름 없음"}
                        </TableCell>
                        <TableCell>{enrollment.courses?.title || "강좌명 없음"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={enrollment.calculated_progress || parseFloat(enrollment.progress.toString())} className="w-24" />
                            <span className="text-sm">{Math.round(enrollment.calculated_progress || parseFloat(enrollment.progress.toString()))}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{getProgressBadge(enrollment.calculated_progress || parseFloat(enrollment.progress.toString()))}</TableCell>
                        <TableCell>{new Date(enrollment.enrolled_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {enrollment.completed_at
                            ? new Date(enrollment.completed_at).toLocaleDateString()
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI 학습 분석 및 이탈 예측
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>학생 ID</TableHead>
                      <TableHead>학습 시간</TableHead>
                      <TableHead>완료 레슨</TableHead>
                      <TableHead>참여도</TableHead>
                      <TableHead>이탈 위험도</TableHead>
                      <TableHead>마지막 활동</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.map((analytic) => (
                      <TableRow key={analytic.id}>
                        <TableCell className="font-mono text-sm">
                          {analytic.user_id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>{analytic.total_time_minutes}분</TableCell>
                        <TableCell>{analytic.lessons_completed}개</TableCell>
                        <TableCell>
                          {analytic.engagement_score ? (
                            <div className="flex items-center gap-2">
                              {analytic.engagement_score >= 70 ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              )}
                              <span>{Math.round(analytic.engagement_score)}%</span>
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{getAtRiskBadge(analytic.at_risk_score)}</TableCell>
                        <TableCell>
                          {analytic.last_activity_at
                            ? new Date(analytic.last_activity_at).toLocaleDateString()
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>이수 완료자 목록</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>학생</TableHead>
                      <TableHead>강좌</TableHead>
                      <TableHead>수강 기간</TableHead>
                      <TableHead>완료일</TableHead>
                      <TableHead>인증서</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">
                          {enrollment.profiles?.full_name || "이름 없음"}
                        </TableCell>
                        <TableCell>{enrollment.courses?.title || "강좌명 없음"}</TableCell>
                        <TableCell>
                          {Math.ceil(
                            (new Date(enrollment.completed_at!).getTime() -
                              new Date(enrollment.enrolled_at).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}일
                        </TableCell>
                        <TableCell>
                          {enrollment.completed_at
                            ? new Date(enrollment.completed_at).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Award className="h-4 w-4 mr-2" />
                            발급
                          </Button>
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

export default AdminLearning;
