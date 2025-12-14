import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, BookOpen, CheckCircle, PlayCircle, Clock, MessageCircle, FileCheck, Languages, Video, ExternalLink, Lock, AlertTriangle } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import KDTVideoPlayer from "@/components/kdt/KDTVideoPlayer";
import KDTProgressEnforcer from "@/components/kdt/KDTProgressEnforcer";
import { useKDTCompliance } from "@/hooks/useKDTCompliance";
import { AITutorDialog } from "@/components/ai/AITutorDialog";
import { AIFeedbackDialog } from "@/components/ai/AIFeedbackDialog";
import { AITranslateDialog } from "@/components/ai/AITranslateDialog";
import { CourseChatRoom } from "@/components/course/CourseChatRoom";
import { AtomSpinner } from "@/components/AtomSpinner";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  level: string;
  duration_hours: number;
  course_type: string;
  live_scheduled_at: string | null;
  live_meeting_url: string | null;
  live_meeting_provider: string | null;
}

interface CourseContent {
  id: string;
  title: string;
  description: string;
  video_url: string;
  video_provider: string;
  duration_minutes: number;
  order_index: number;
  content_type: string;
}

interface ContentProgress {
  content_id: string;
  progress_percentage: number;
  completed: boolean;
}

const StudentCourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const isDemoMode = searchParams.get("demo") === "true";
  const demoRole = searchParams.get("role") as "student" | "teacher" | "admin" | null;
  const [course, setCourse] = useState<Course | null>(null);
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [currentContent, setCurrentContent] = useState<CourseContent | null>(null);
  const [progress, setProgress] = useState<ContentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"student" | "teacher" | "admin">(demoRole || "student");
  const [aiTutorOpen, setAiTutorOpen] = useState(false);
  const [aiFeedbackOpen, setAiFeedbackOpen] = useState(false);
  const [aiTranslateOpen, setAiTranslateOpen] = useState(false);

  // KDT 컴플라이언스 훅
  const { logProgressSkipAttempt, logSpeedViolation } = useKDTCompliance({
    courseId: id,
    contentId: currentContent?.id,
  });

  // 데모 모드 데이터 설정
  const setMockDemoData = () => {
    const mockCourse: Course = {
      id: id || "course-1",
      title: "AI 기반 웹 개발 완성 과정",
      description: "최신 AI 도구를 활용한 웹 개발 실무 과정입니다. React, TypeScript, Tailwind CSS를 사용하여 현대적인 웹 애플리케이션을 개발하는 방법을 배웁니다.",
      thumbnail_url: "",
      level: "intermediate",
      duration_hours: 24,
      course_type: "vod",
      live_scheduled_at: null,
      live_meeting_url: null,
      live_meeting_provider: null
    };

    const mockContents: CourseContent[] = [
      {
        id: "content-1",
        title: "1강. 웹 개발 환경 설정 및 AI 도구 소개",
        description: "개발 환경을 구축하고 AI 도구의 기본 사용법을 익힙니다",
        video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        video_provider: "youtube",
        duration_minutes: 45,
        order_index: 1,
        content_type: "video"
      },
      {
        id: "content-2",
        title: "2강. React 컴포넌트와 AI 코드 생성",
        description: "AI를 활용한 React 컴포넌트 개발 실습",
        video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        video_provider: "youtube",
        duration_minutes: 60,
        order_index: 2,
        content_type: "video"
      },
      {
        id: "content-3",
        title: "3강. TypeScript 타입 시스템 마스터하기",
        description: "TypeScript의 고급 타입 기능과 AI 보조 도구 활용",
        video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        video_provider: "youtube",
        duration_minutes: 50,
        order_index: 3,
        content_type: "video"
      },
      {
        id: "content-4",
        title: "4강. Tailwind CSS와 디자인 시스템",
        description: "효율적인 스타일링과 반응형 디자인 구현",
        video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        video_provider: "youtube",
        duration_minutes: 55,
        order_index: 4,
        content_type: "video"
      },
      {
        id: "content-5",
        title: "5강. 상태 관리와 데이터 흐름",
        description: "React Hook과 Context API를 활용한 상태 관리",
        video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        video_provider: "youtube",
        duration_minutes: 65,
        order_index: 5,
        content_type: "video"
      }
    ];

    const mockProgress: ContentProgress[] = [
      { content_id: "content-1", progress_percentage: 100, completed: true },
      { content_id: "content-2", progress_percentage: 75, completed: false },
      { content_id: "content-3", progress_percentage: 30, completed: false }
    ];

    setCourse(mockCourse);
    setContents(mockContents);
    setCurrentContent(mockContents[0]);
    setProgress(mockProgress);
    setLoading(false);
  };

  useEffect(() => {
    // 강의 ID가 변경될 때 이전 데이터 초기화
    setCourse(null);
    setContents([]);
    setCurrentContent(null);
    setProgress([]);
    setLoading(true);

    if (isDemoMode) {
      setMockDemoData();
    } else {
      checkUserRole();
      if (id) {
        ensureEnrollment();
        fetchCourseDetails();
        fetchCourseContents();
        fetchProgress();
      }
    }

    // 페이지가 다시 표시될 때 데이터 새로고침
    const handleVisibilityChange = () => {
      if (!document.hidden && !isDemoMode && id) {
        fetchCourseDetails();
        fetchCourseContents();
        fetchProgress();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [id, isDemoMode]);

  const ensureEnrollment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", id)
        .single();

      // If not enrolled, create enrollment
      if (!existingEnrollment) {
        const { error } = await supabase
          .from("enrollments")
          .insert({
            user_id: user.id,
            course_id: id,
            enrolled_at: new Date().toISOString(),
            progress: 0
          });

        if (error) {
          console.error("Error creating enrollment:", error);
        }
      }
    } catch (error) {
      console.error("Error ensuring enrollment:", error);
    }
  };

  const checkUserRole = async () => {
    // 학생 페이지에서는 항상 student 역할 유지
    setUserRole("student");
  };

  const fetchCourseDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setCourse(data);
    } catch (error) {
      console.error("Error fetching course:", error);
      toast({
        title: "오류",
        description: "강좌 정보를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseContents = async () => {
    try {
      const { data, error } = await supabase
        .from("course_contents")
        .select("*")
        .eq("course_id", id)
        .eq("is_published", true)
        .order("order_index", { ascending: true });

      if (error) throw error;
      setContents(data || []);
      if (data && data.length > 0) {
        setCurrentContent(data[0]);
      }
    } catch (error) {
      console.error("Error fetching course contents:", error);
    }
  };

  const fetchProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("content_progress")
        .select("content_id, progress_percentage, completed")
        .eq("user_id", user.id);

      if (error) throw error;
      setProgress(data || []);
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  const getContentProgress = (contentId: string) => {
    const contentProgress = progress.find(p => p.content_id === contentId);
    return contentProgress?.progress_percentage || 0;
  };

  const isContentCompleted = (contentId: string) => {
    return progress.some(p => p.content_id === contentId && p.completed);
  };

  const handleProgressUpdate = (progressPercentage: number, position: number) => {
    // Progress is automatically saved in VideoPlayer component
    fetchProgress();
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case "beginner": return "초급";
      case "intermediate": return "중급";
      case "advanced": return "고급";
      default: return level;
    }
  };

  // 라이브 강의 입장 가능 여부 확인
  const canJoinLiveSession = (scheduledAt: string | null) => {
    if (!scheduledAt) return false;
    const scheduledTime = new Date(scheduledAt).getTime();
    const now = Date.now();
    const thirtyMinutesInMs = 30 * 60 * 1000;
    return now >= scheduledTime - thirtyMinutesInMs;
  };

  const formatLiveSchedule = (scheduledAt: string | null) => {
    if (!scheduledAt) return "";
    const date = new Date(scheduledAt);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const overallProgress = contents.length > 0
    ? (progress.filter(p => contents.some(c => c.id === p.content_id && p.completed)).length / contents.length) * 100
    : 0;

  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AtomSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">강좌 정보를 불러오는 중...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">강좌를 찾을 수 없습니다</h2>
          <p className="text-muted-foreground mb-6">요청하신 강좌가 존재하지 않거나 접근 권한이 없습니다</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            돌아가기
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="default">{getLevelText(course.level)}</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{course.duration_hours}시간</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <PlayCircle className="h-4 w-4" />
                <span>{contents.length}개 차시</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Session Banner or Progress */}
        {course.course_type === 'live' ? (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-lg">라이브 강의</span>
                    <Badge variant="default">LIVE</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">예정 시간</p>
                    <p className="font-medium">{formatLiveSchedule(course.live_scheduled_at)}</p>
                  </div>
                  {course.live_meeting_provider && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>플랫폼:</span>
                      <span className="capitalize">{course.live_meeting_provider.replace('_', ' ')}</span>
                    </div>
                  )}
                </div>
                {canJoinLiveSession(course.live_scheduled_at) && course.live_meeting_url ? (
                  <Button 
                    size="lg" 
                    variant="premium"
                    className="gap-2"
                    onClick={() => window.open(course.live_meeting_url!, '_blank')}
                  >
                    <ExternalLink className="h-5 w-5" />
                    라이브 강의 입장
                  </Button>
                ) : (
                  <div className="text-center px-4 py-2 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">입장 가능 시간</p>
                    <p className="font-medium text-sm">시작 30분 전부터</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">전체 진행률</span>
                  <span className="font-semibold">{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  {progress.filter(p => contents.some(c => c.id === p.content_id && p.completed)).length}/{contents.length} 차시 완료
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI 기능 버튼 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              AI 학습 도우미
              <Badge variant="default" className="text-xs">AI</Badge>
            </CardTitle>
            <CardDescription>AI 기반 학습 지원 기능을 활용해보세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button 
                variant="outline" 
                onClick={() => setAiTutorOpen(true)}
                className="w-full justify-start gap-2 relative"
              >
                <Badge variant="default" className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5 h-auto">
                  AI
                </Badge>
                <MessageCircle className="h-4 w-4" />
                AI 튜터
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setAiFeedbackOpen(true)}
                className="w-full justify-start gap-2 relative"
              >
                <Badge variant="default" className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5 h-auto">
                  AI
                </Badge>
                <FileCheck className="h-4 w-4" />
                AI 피드백
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setAiTranslateOpen(true)}
                className="w-full justify-start gap-2 relative"
              >
                <Badge variant="default" className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5 h-auto">
                  AI
                </Badge>
                <Languages className="h-4 w-4" />
                AI 번역
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-4">
            {currentContent ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>{currentContent.title}</CardTitle>
                    {currentContent.description && (
                      <CardDescription>{currentContent.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {currentContent.video_url ? (
                      <KDTVideoPlayer
                        contentId={currentContent.id}
                        videoUrl={currentContent.video_url}
                        videoProvider={currentContent.video_provider as "youtube" | "vimeo" | "direct"}
                        onProgressUpdate={handleProgressUpdate}
                        onSpeedViolation={logSpeedViolation}
                        minimumWatchPercent={80}
                      />
                    ) : (
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">동영상이 없습니다</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Tabs defaultValue="description">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="description">강의 정보</TabsTrigger>
                    <TabsTrigger value="chat">실시간 Q&A</TabsTrigger>
                    <TabsTrigger value="notes">학습 노트</TabsTrigger>
                  </TabsList>
                  <TabsContent value="description" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {course.description || "강좌 설명이 없습니다."}
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="chat" className="mt-4">
                    <CourseChatRoom courseId={id!} />
                  </TabsContent>
                  <TabsContent value="notes" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">
                          학습 노트 기능은 준비 중입니다.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <PlayCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">왼쪽 목록에서 차시를 선택해주세요</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Curriculum */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  커리큘럼
                  <Badge variant="outline" className="text-xs">KDT</Badge>
                </CardTitle>
                <CardDescription>{contents.length}개 차시 • 순차 학습 필수</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-2 max-h-[600px] overflow-y-auto overflow-x-visible">
                  {contents.length === 0 ? (
                    <p className="text-sm text-center py-8 text-muted-foreground">
                      등록된 차시가 없습니다
                    </p>
                  ) : (
                    <KDTProgressEnforcer
                      contents={contents.map(c => ({ id: c.id, title: c.title, order_index: c.order_index }))}
                      progress={progress}
                      currentContentId={currentContent?.id || ""}
                      onSelectContent={(content) => {
                        const fullContent = contents.find(c => c.id === content.id);
                        if (fullContent) setCurrentContent(fullContent);
                      }}
                      onSkipAttempt={logProgressSkipAttempt}
                      requiredProgressPercent={80}
                    >
                      {({ canAccess, getLockedReason }) => (
                        <>
                          {contents.map((content, index) => {
                            const isAccessible = canAccess(content.id);
                            const lockedReason = getLockedReason(content.id);
                            const isSelected = currentContent?.id === content.id;
                            const isCompleted = isContentCompleted(content.id);
                            const progressValue = getContentProgress(content.id);
                            
                            return (
                              <div
                                key={content.id}
                                className={`
                                  relative rounded-xl transition-all duration-200 ml-1
                                  ${isSelected 
                                    ? "bg-primary/5 ring-2 ring-primary shadow-sm" 
                                    : "hover:bg-accent/40"
                                  }
                                  ${!isAccessible ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                                `}
                                onClick={() => {
                                  if (isAccessible) {
                                    setCurrentContent(content);
                                  } else {
                                    logProgressSkipAttempt(
                                      contents.findIndex(c => c.id === currentContent?.id) + 1,
                                      index + 1
                                    );
                                    toast({
                                      title: "차시 잠김",
                                      description: lockedReason || "이전 차시를 먼저 완료해주세요.",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              >
                                <div className="p-3 flex items-center gap-3">
                                  {/* Status Icon - Always circular */}
                                  <div 
                                    className={`
                                      flex items-center justify-center flex-shrink-0 transition-all duration-200
                                      w-11 h-11 rounded-full
                                      ${!isAccessible 
                                        ? "bg-muted/60 border-2 border-border/50" 
                                        : isCompleted 
                                          ? "bg-green-500/10 border-2 border-green-500 shadow-sm shadow-green-500/20" 
                                          : isSelected
                                            ? "bg-primary/10 border-2 border-primary shadow-sm shadow-primary/20"
                                            : "bg-muted/80 border-2 border-border/60 hover:border-primary/30"
                                      }
                                    `}
                                    style={{ borderRadius: '50%' }}
                                  >
                                    {!isAccessible ? (
                                      <Lock className="h-4 w-4 text-muted-foreground" />
                                    ) : isCompleted ? (
                                      <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : (
                                      <span className={`text-sm font-bold ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                                        {index + 1}
                                      </span>
                                    )}
                                  </div>

                                  {/* Content Info */}
                                  <div className="flex-1 min-w-0">
                                    <p className={`
                                      text-sm font-medium line-clamp-1 transition-colors
                                      ${isSelected ? "text-primary" : ""}
                                      ${!isAccessible ? "text-muted-foreground" : ""}
                                    `}>
                                      {content.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-xs text-muted-foreground">
                                        {content.duration_minutes}분
                                      </span>
                                      {progressValue > 0 && (
                                        <span className={`
                                          text-xs font-semibold
                                          ${progressValue >= 80 ? "text-green-500" : "text-primary"}
                                        `}>
                                          {Math.round(progressValue)}%
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Locked Warning */}
                                {!isAccessible && lockedReason && (
                                  <div className="mx-3 mb-3 flex items-start gap-1.5 p-2 bg-orange-500/10 rounded-lg text-[11px] text-orange-600 dark:text-orange-400">
                                    <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                    <span>{lockedReason}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </>
                      )}
                    </KDTProgressEnforcer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI 다이얼로그들 */}
      <AITutorDialog 
        open={aiTutorOpen} 
        onOpenChange={setAiTutorOpen} 
        courseContext={course?.title}
      />
      <AIFeedbackDialog 
        open={aiFeedbackOpen} 
        onOpenChange={setAiFeedbackOpen} 
      />
      <AITranslateDialog 
        open={aiTranslateOpen} 
        onOpenChange={setAiTranslateOpen} 
      />
    </DashboardLayout>
  );
};

export default StudentCourseDetail;
