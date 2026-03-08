import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Users, BookOpen, DollarSign, TrendingUp, Plus, Eye, Edit, Brain, Sparkles, FileQuestion, FileText, Bot, LayoutDashboard, Loader2 } from "lucide-react";
import { AIQuizDialog } from "@/components/ai/AIQuizDialog";
import { AISummaryDialog } from "@/components/ai/AISummaryDialog";
import { AITutorDialog } from "@/components/ai/AITutorDialog";
import { CourseFormDialog } from "@/components/teacher/CourseFormDialog";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTeacherDashboardStats } from "@/hooks/useDashboardStats";
import { usePageTiming } from "@/hooks/usePageTiming";

const TeacherDashboard = ({ isDemo = false }: { isDemo?: boolean }) => {
  usePageTiming("TeacherDashboard");
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | undefined>();
  const { data: stats, isLoading } = useTeacherDashboardStats(userId);
  
  const [quizOpen, setQuizOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [aiTutorOpen, setAiTutorOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUser();
  }, []);

  const handleView = (courseTitle: string) => {
    // Mock data이므로 강의 관리 페이지로 이동
    navigate('/teacher/courses');
  };

  const handleEdit = (course: any) => {
    setSelectedCourse(course);
    setEditDialogOpen(true);
  };

  return (
    <DashboardLayout userRole="teacher" isDemo={isDemo}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              강사 대시보드
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {isDemo ? 'AI 기반 과제 채점으로 더 효율적인 강의 운영을 경험하세요' : '학생들의 학습을 관리하고 분석하세요'}
            </p>
          </div>
          <Button className="gap-2 w-full sm:w-auto flex-shrink-0" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            새 강의 만들기
          </Button>
        </div>

        {/* Stats Cards */}
        <div className={`grid gap-4 md:grid-cols-2 ${isDemo ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
          <StatsCard
            title="전체 학생"
            value={isLoading ? "-" : stats?.totalStudents.toLocaleString() || "0"}
            icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
            description={`내 강좌 수강생`}
            trend="up"
          />
          <StatsCard
            title="활성 강의"
            value={isLoading ? "-" : stats?.activeCourses.toString() || "0"}
            icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
            description={`대기 중 ${stats?.pendingCourses || 0}개`}
          />
          {isDemo && (
            <Card className="overflow-hidden border-primary/20 bg-primary/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium whitespace-nowrap flex items-center gap-1">
                  AI 채점
                  <Badge variant="default" className="text-[8px] px-1 py-0">AI</Badge>
                </CardTitle>
                <Brain className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">28건</div>
                <p className="text-xs text-muted-foreground">자동 채점 완료</p>
              </CardContent>
            </Card>
          )}
          <StatsCard
            title="전체 강좌"
            value={isLoading ? "-" : stats?.totalCourses.toString() || "0"}
            icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
            description="등록한 강좌"
            trend="up"
          />
          <StatsCard
            title="최근 제출"
            value={isLoading ? "-" : stats?.recentSubmissions?.length?.toString() || "0"}
            icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
            description="최근 과제 제출"
          />
        </div>

        {/* My Courses */}
        <Card>
          <CardHeader>
            <CardTitle>내 강의</CardTitle>
            <CardDescription>강의를 관리하고 학생들의 진행상황을 확인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : stats?.coursesWithStats && stats.coursesWithStats.length > 0 ? (
                stats.coursesWithStats.map((course) => (
                  <CourseItem
                    key={course.id}
                    title={course.title}
                    students={course.studentCount}
                    rating={0}
                    revenue=""
                    status={course.status}
                    onView={() => navigate('/teacher/courses')}
                    onEdit={() => handleEdit({
                      id: course.id,
                      title: course.title,
                      description: "",
                      level: "beginner" as const,
                      duration_hours: 0,
                      price: 0,
                      status: course.status as any,
                      slug: course.id
                    })}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  등록된 강좌가 없습니다. 새 강의를 만들어보세요!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity & Revenue Chart */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>최근 과제 제출</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : stats?.recentSubmissions && stats.recentSubmissions.length > 0 ? (
                  stats.recentSubmissions.map((submission: any, index: number) => (
                    <ActivityItem
                      key={submission.id || index}
                      student={submission.studentName || '학생'}
                      action="과제 제출"
                      course={submission.assignment?.course?.title || '강좌'}
                      time={submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString('ko-KR') : ''}
                    />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">최근 제출된 과제가 없습니다</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>강좌 통계</CardTitle>
              <CardDescription>내 강좌 현황</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">전체 강좌</span>
                  <span className="font-medium">{stats?.totalCourses || 0}개</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">활성 강좌</span>
                  <span className="font-medium">{stats?.activeCourses || 0}개</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">전체 수강생</span>
                  <span className="font-medium">{stats?.totalStudents || 0}명</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">대기 중 강좌</span>
                  <span className="font-medium">{stats?.pendingCourses || 0}개</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Features for Teachers */}
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI 강의 도구
                <Badge variant="default" className="text-xs">AI</Badge>
              </CardTitle>
              <CardDescription>
                AI로 강의 준비와 학생 관리를 더 효율적으로
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <button
                  onClick={() => setAiTutorOpen(true)}
                  className="p-4 rounded-lg bg-background border border-border hover:border-primary/50 hover:shadow-glow transition-all text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">AI 튜터</h4>
                      <Badge variant="default" className="text-[8px] px-1 py-0">AI</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    강의 주제에 대해 질문하고 답변을 받으세요
                  </p>
                </button>

                <button
                  onClick={() => setQuizOpen(true)}
                  className="p-4 rounded-lg bg-background border border-border hover:border-primary/50 hover:shadow-glow transition-all text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                      <FileQuestion className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">AI 퀴즈 생성</h4>
                      <Badge variant="default" className="text-[8px] px-1 py-0">AI</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    강의 주제에 맞는 퀴즈를 자동으로 생성하세요
                  </p>
                </button>

                <button
                  onClick={() => setSummaryOpen(true)}
                  className="p-4 rounded-lg bg-background border border-border hover:border-primary/50 hover:shadow-glow transition-all text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">AI 요약</h4>
                      <Badge variant="default" className="text-[8px] px-1 py-0">AI</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    강의 자료를 빠르게 요약하세요
                  </p>
                </button>
              </div>
            </CardContent>
          </Card>

        {/* AI Dialogs */}
        <AITutorDialog open={aiTutorOpen} onOpenChange={setAiTutorOpen} courseContext="강의 준비" />
        <AIQuizDialog open={quizOpen} onOpenChange={setQuizOpen} />
        <AISummaryDialog open={summaryOpen} onOpenChange={setSummaryOpen} />
        
        {/* Course Form Dialog */}
        <CourseFormDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={() => {
            setCreateDialogOpen(false);
            navigate('/teacher/courses');
          }}
        />
        
        <CourseFormDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          course={selectedCourse}
          onSuccess={() => {
            setEditDialogOpen(false);
            setSelectedCourse(null);
          }}
        />
      </div>
    </DashboardLayout>
  );
};

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  description, 
  trend 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  description: string; 
  trend?: "up" | "down";
}) => (
  <Card className="overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium whitespace-nowrap">{title}</CardTitle>
      <div className="text-muted-foreground flex-shrink-0">{icon}</div>
    </CardHeader>
    <CardContent className="space-y-1">
      <div className="text-2xl font-bold whitespace-nowrap overflow-hidden text-ellipsis">{value}</div>
      <p className={`text-xs whitespace-nowrap overflow-hidden text-ellipsis ${trend === "up" ? "text-green-600" : "text-muted-foreground"}`}>
        {description}
      </p>
    </CardContent>
  </Card>
);

const CourseItem = ({ 
  title, 
  students, 
  rating, 
  revenue, 
  status,
  onView,
  onEdit
}: { 
  title: string; 
  students: number; 
  rating: number; 
  revenue: string; 
  status: string;
  onView: () => void;
  onEdit: () => void;
}) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg border hover:border-primary/50 transition-colors">
    <div className="flex-1 min-w-0">
      <h4 className="font-semibold text-sm md:text-base truncate">{title}</h4>
      <div className="flex items-center gap-2 md:gap-4 mt-1 text-xs md:text-sm text-muted-foreground flex-wrap">
        <span>{students} 학생</span>
        <span>⭐ {rating}</span>
        <span className="truncate">{revenue}</span>
      </div>
    </div>
    <div className="flex gap-2 w-full sm:w-auto">
      <Button size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={onView}>
        <Eye className="h-4 w-4 mr-1" />
        보기
      </Button>
      <Button size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={onEdit}>
        <Edit className="h-4 w-4 mr-1" />
        편집
      </Button>
    </div>
  </div>
);

const ActivityItem = ({ 
  student, 
  action, 
  course, 
  time 
}: { 
  student: string; 
  action: string; 
  course: string; 
  time: string;
}) => (
  <div className="flex items-start gap-2 md:gap-3">
    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-medium text-primary">{student[0]}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs md:text-sm">
        <span className="font-medium">{student}</span>
        <span className="text-muted-foreground"> {action}</span>
      </p>
      <p className="text-xs text-muted-foreground truncate">{course}</p>
    </div>
    <span className="text-xs text-muted-foreground whitespace-nowrap">{time}</span>
  </div>
);

export default TeacherDashboard;
