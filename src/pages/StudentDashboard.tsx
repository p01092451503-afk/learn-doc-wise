import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { BookOpen, Clock, Award, TrendingUp, PlayCircle, FileText, Brain, Sparkles, Route, FileQuestion, Users, LayoutDashboard, Video, Calendar, Loader2 } from "lucide-react";
import { Chatbot } from "@/components/Chatbot";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/i18n/translations";
import { useQuery } from "@tanstack/react-query";
import { AILearningPathDialog } from "@/components/ai/AILearningPathDialog";
import { AIQuizDialog } from "@/components/ai/AIQuizDialog";
import { AISummaryDialog } from "@/components/ai/AISummaryDialog";
import { AIProgressDialog } from "@/components/ai/AIProgressDialog";
import { AIStudyMatchDialog } from "@/components/ai/AIStudyMatchDialog";
import { AITutorDialog } from "@/components/ai/AITutorDialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useStudentDashboardStats } from "@/hooks/useDashboardStats";

interface LiveSession {
  id: string;
  title: string;
  description: string | null;
  instructor_id: string;
  status: string;
  scheduled_at: string;
  instructor_name?: string;
}

const StudentDashboard = ({ isDemo = false }: { isDemo?: boolean }) => {
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(language, key);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [userId, setUserId] = useState<string | undefined>();
  const { data: stats, isLoading: loadingStats } = useStudentDashboardStats(userId);
  
  const [learningPathOpen, setLearningPathOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [studyMatchOpen, setStudyMatchOpen] = useState(false);
  const [aiTutorOpen, setAiTutorOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUser();
  }, []);

  // 🚀 PERFORMANCE: React Query로 라이브 세션 캐싱
  const { data: liveSessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['live-sessions-upcoming'],
    queryFn: async () => {
      const { data: sessions, error } = await supabase
        .from('live_sessions')
        .select('*')
        .in('status', ['scheduled', 'live'])
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(5);

      if (error) throw error;

      if (!sessions || sessions.length === 0) return [];

      // 🚀 PERFORMANCE: 병렬로 강사 정보 조회
      const instructorIds = [...new Set(sessions.map(s => s.instructor_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', instructorIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      return sessions.map(session => ({
        ...session,
        instructor_name: profileMap.get(session.instructor_id) || '강사',
      }));
    },
    staleTime: 2 * 60 * 1000,  // 2분 캐싱
    enabled: !isDemo,           // 데모 모드에서는 비활성화
  });

  const handleJoinSession = (sessionId: string, status: string) => {
    if (status === 'live') {
      navigate(`/student/live-session/${sessionId}`);
    } else {
      toast({
        title: "예정된 세션",
        description: "세션이 시작되면 참여할 수 있습니다.",
      });
    }
  };
  
  return (
    <DashboardLayout userRole="student" isDemo={isDemo}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-2 flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-primary" />
              <span className="text-gradient">{t('learningDashboard')}</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base lg:text-lg">
              <span className="hidden sm:inline">{language === 'ko' ? '안녕하세요! ' : 'Hello! '}</span>
              {isDemo ? t('aiLearningMessage') : t('welcomeMessage')}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title={t('enrolledCourses')}
            value={loadingStats ? "-" : stats?.enrolledCourses.toString() || "0"}
            icon={loadingStats ? <Loader2 className="h-5 w-5 animate-spin" /> : <BookOpen className="h-5 w-5" />}
            description={`수강 중인 강좌`}
          />
          <StatsCard
            title={t('learningTime')}
            value={loadingStats ? "-" : `${stats?.learningHours || "0"}h`}
            icon={loadingStats ? <Loader2 className="h-5 w-5 animate-spin" /> : <Clock className="h-5 w-5" />}
            description={t('thisWeek')}
          />
          <StatsCard
            title={t('completedAssignments')}
            value={loadingStats ? "-" : stats?.completedAssignments.toString() || "0"}
            icon={loadingStats ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
            description={`총 ${stats?.totalAssignments || 0}개 중`}
          />
          <StatsCard
            title={t('earnedBadges')}
            value={loadingStats ? "-" : stats?.earnedBadges.toString() || "0"}
            icon={loadingStats ? <Loader2 className="h-5 w-5 animate-spin" /> : <Award className="h-5 w-5" />}
            description="획득한 배지"
          />
        </div>

        {/* Live Sessions */}
        {!loadingSessions && liveSessions.length > 0 && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                예정된 라이브 세션
                <Badge variant="default" className="text-xs">LIVE</Badge>
              </CardTitle>
              <CardDescription>
                실시간으로 강사와 소통하며 학습하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {liveSessions.map((session) => (
                  <LiveSessionCard
                    key={session.id}
                    session={session}
                    onJoin={handleJoinSession}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Courses */}
        <Card>
          <CardHeader>
            <CardTitle>{t('ongoingCourses')}</CardTitle>
            <CardDescription>{t('continueDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <CourseProgress
                title="React 완벽 가이드"
                instructor="김철수"
                progress={65}
                nextLesson="State Management 심화"
              />
              <CourseProgress
                title="TypeScript 마스터클래스"
                instructor="이영희"
                progress={42}
                nextLesson="Generic Types"
              />
              <CourseProgress
                title="UI/UX 디자인 기초"
                instructor="박지민"
                progress={88}
                nextLesson="사용자 테스트"
              />
            </div>
          </CardContent>
        </Card>

        {/* Learning Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t('learningStats')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{t('weeklyGoal')}</span>
                    <span className="text-sm font-medium">15h / 20h</span>
                  </div>
                  <Progress value={75} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{t('assignmentCompletion')}</span>
                    <span className="text-sm font-medium">80%</span>
                  </div>
                  <Progress value={80} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{t('avgScore')}</span>
                    <span className="text-sm font-medium">92{t('points')}</span>
                  </div>
                  <Progress value={92} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {t('recommendedCourses')}
                {isDemo && <Badge variant="default" className="text-xs">{t('aiRecommendation')}</Badge>}
              </CardTitle>
              <CardDescription>{t('aiRecommendationDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <RecommendedCourse
                  title="Next.js 풀스택 개발"
                  instructor="정민수"
                  rating={4.8}
                  students={2450}
                />
                <RecommendedCourse
                  title="디자인 시스템 구축"
                  instructor="최서연"
                  rating={4.9}
                  students={1823}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Features Section */}
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                {t('aiLearningHelper')}
                <Badge variant="default" className="text-xs">AI</Badge>
              </CardTitle>
              <CardDescription>
                {t('aiLearningDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <button
                  onClick={() => setLearningPathOpen(true)}
                  className="p-4 rounded-lg bg-background border border-border hover:border-primary/50 hover:shadow-glow transition-all text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                      <Route className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">AI 학습 경로 추천</h4>
                      <Badge variant="default" className="text-[8px] px-1 py-0">AI</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    맞춤형 학습 경로를 추천받으세요
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
                    맞춤형 연습 문제를 생성하세요
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
                    강의 내용을 빠르게 요약하세요
                  </p>
                </button>

                <button
                  onClick={() => setProgressOpen(true)}
                  className="p-4 rounded-lg bg-background border border-border hover:border-primary/50 hover:shadow-glow transition-all text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">AI 진도 예측</h4>
                      <Badge variant="default" className="text-[8px] px-1 py-0">AI</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    완료 시점을 예측하고 목표를 관리하세요
                  </p>
                </button>

                <button
                  onClick={() => setStudyMatchOpen(true)}
                  className="p-4 rounded-lg bg-background border border-border hover:border-primary/50 hover:shadow-glow transition-all text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">AI 스터디 메이트</h4>
                      <Badge variant="default" className="text-[8px] px-1 py-0">AI</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    비슷한 수준의 학습 동료를 찾으세요
                  </p>
                </button>

                <button
                  onClick={() => setAiTutorOpen(true)}
                  className="p-4 rounded-lg bg-background border border-border hover:border-primary/50 hover:shadow-glow transition-all text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{t('aiTutor')}</h4>
                      <Badge variant="default" className="text-[8px] px-1 py-0">AI</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('aiTutorDesc')}
                  </p>
                </button>
              </div>
            </CardContent>
          </Card>
      </div>

      {/* AI Dialogs */}
      <AILearningPathDialog open={learningPathOpen} onOpenChange={setLearningPathOpen} />
      <AIQuizDialog open={quizOpen} onOpenChange={setQuizOpen} />
      <AISummaryDialog open={summaryOpen} onOpenChange={setSummaryOpen} />
      <AIProgressDialog open={progressOpen} onOpenChange={setProgressOpen} />
      <AIStudyMatchDialog open={studyMatchOpen} onOpenChange={setStudyMatchOpen} />
      <AITutorDialog open={aiTutorOpen} onOpenChange={setAiTutorOpen} courseContext="학습 대시보드" />

      {/* 챗봇 - 숨김 */}
      {/* <Chatbot userRole="user" /> */}
    </DashboardLayout>
  );
};

const StatsCard = ({ title, value, icon, description }: { title: string; value: string; icon: React.ReactNode; description: string }) => (
  <Card className="card-premium border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground whitespace-nowrap">{title}</CardTitle>
      <div className="text-primary p-2 bg-primary/10 rounded-xl flex-shrink-0">{icon}</div>
    </CardHeader>
    <CardContent className="space-y-1 min-w-0">
      <div className="text-3xl font-display font-bold text-gradient whitespace-nowrap overflow-x-auto scrollbar-hide">{value}</div>
      <p className="text-xs text-muted-foreground whitespace-nowrap">{description}</p>
    </CardContent>
  </Card>
);

const CourseProgress = ({ title, instructor, progress, nextLesson }: { title: string; instructor: string; progress: number; nextLesson: string }) => {
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(language, key);
  const navigate = useNavigate();
  
  const handleContinue = () => {
    // 강의 페이지로 이동
    navigate("/student/courses");
  };
  
  return (
    <div className="space-y-3 p-4 md:p-5 rounded-2xl border border-border/50 hover:border-primary/50 hover:shadow-premium transition-all duration-300 card-premium">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-display font-semibold text-base md:text-lg truncate">{title}</h4>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">{instructor}</p>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          className="rounded-xl w-full sm:w-auto flex-shrink-0 relative z-10 pointer-events-auto"
          onClick={handleContinue}
          type="button"
        >
          <PlayCircle className="h-4 w-4 mr-1" />
          {t('continue')}
        </Button>
      </div>
      <div>
        <div className="flex justify-between mb-2 text-xs md:text-sm">
          <span className="text-muted-foreground">{t('progress')}</span>
          <span className="font-semibold text-primary">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      <p className="text-xs md:text-sm text-muted-foreground truncate">{t('nextLesson')}: {nextLesson}</p>
    </div>
  );
};

const RecommendedCourse = ({ title, instructor, rating, students }: { title: string; instructor: string; rating: number; students: number }) => {
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(language, key);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleViewDetails = () => {
    // 강의 목록 페이지로 이동
    navigate("/student/courses");
    toast({
      title: "강의 상세 페이지",
      description: `${title} 강의를 확인하세요.`,
    });
  };
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 rounded-lg border hover:border-primary/50 transition-colors">
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{title}</h4>
        <p className="text-xs text-muted-foreground truncate">{instructor}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs">⭐ {rating}</span>
          <span className="text-xs text-muted-foreground">· {students.toLocaleString()} 수강생</span>
        </div>
      </div>
      <Button 
        size="sm" 
        className="w-full sm:w-auto flex-shrink-0 relative z-10 pointer-events-auto"
        onClick={handleViewDetails}
        type="button"
      >
        {t('viewDetails')}
      </Button>
    </div>
  );
};

const LiveSessionCard = ({ 
  session, 
  onJoin 
}: { 
  session: LiveSession; 
  onJoin: (sessionId: string, status: string) => void;
}) => {
  const isLive = session.status === 'live';
  const scheduledDate = new Date(session.scheduled_at);
  
  return (
    <div className="p-4 rounded-xl border border-border/50 bg-background hover:border-primary/50 hover:shadow-glow transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-base">{session.title}</h4>
            {isLive && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                🔴 LIVE
              </Badge>
            )}
          </div>
          {session.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {session.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {session.instructor_name}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(scheduledDate, 'MM월 dd일 HH:mm', { locale: ko })}
            </span>
          </div>
        </div>
        <Button
          onClick={() => onJoin(session.id, session.status)}
          variant={isLive ? "default" : "outline"}
          size="sm"
          className="w-full sm:w-auto flex-shrink-0"
        >
          <Video className="h-4 w-4 mr-2" />
          {isLive ? "지금 참여하기" : "대기"}
        </Button>
      </div>
    </div>
  );
};

export default StudentDashboard;
