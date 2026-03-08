import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/i18n/translations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { AISearchBar } from "@/components/AISearchBar";
import { AtomSpinner } from "@/components/AtomSpinner";
import logoIcon from "@/assets/logo-icon.png";
import {
  BookOpen, Clock, Users, Star, TrendingUp, Award, User, Brain,
  BarChart3, GraduationCap, Calendar, Bell, ChevronRight, Play,
  Sparkles, Zap, MessageSquare, ClipboardCheck, Trophy, Target,
  LogOut, Settings, Home, Layers, FileText, Activity, PieChart,
  Monitor, Shield, Building2, UserCheck, BookMarked, Flame,
  ArrowUpRight, CheckCircle2, AlertCircle, Megaphone
} from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getVideoThumbnail } from "@/lib/utils";

// ─── Public Hero Section (비로그인) ───
const PublicHeroSection = () => {
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(language, key);

  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">AI 기반 차세대 LMS</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 text-foreground leading-tight animate-slide-up">
            더 스마트한 학습,<br />
            <span className="text-gradient">더 빠른 성장</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            AI 튜터, 자동 채점, 실시간 분석으로 학습 효율을 극대화하세요.
            강사와 학습자 모두를 위한 프리미엄 학습관리 플랫폼입니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/auth">
              <Button size="lg" variant="premium" className="text-lg px-10 gap-2">
                <TrendingUp className="h-5 w-5" />
                무료로 시작하기
              </Button>
            </Link>
            <Link to="/courses">
              <Button size="lg" variant="outline" className="text-lg px-10 gap-2">
                <BookOpen className="h-5 w-5" />
                강좌 둘러보기
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-10 mt-16">
            <div className="flex items-center gap-3">
              <Award className="h-7 w-7 text-accent" />
              <span className="text-base font-semibold text-foreground">평점 4.9/5.0</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-7 w-7 text-accent" />
              <span className="text-base font-semibold text-foreground">10,000+ 학습자</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 text-accent" />
              <span className="text-base font-semibold text-foreground">99.9% 업타임</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Public Course Grid ───
const PublicCourseGrid = () => {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['publicCourses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select(`*, course_contents(video_url, video_provider, order_index)`)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data || []).map((course: any) => {
        const { course_contents, ...rest } = course;
        if (!rest.thumbnail_url && course_contents?.length > 0) {
          const sorted = [...course_contents].sort((a: any, b: any) => a.order_index - b.order_index);
          rest.videoThumbnail = getVideoThumbnail(sorted[0].video_url, sorted[0].video_provider);
        }
        return rest;
      });
    },
    staleTime: 5 * 60 * 1000,
  });

  const getLevelInfo = (level: string) => {
    switch (level) {
      case "beginner": return { label: "입문", variant: "default" as const };
      case "intermediate": return { label: "중급", variant: "secondary" as const };
      case "advanced": return { label: "고급", variant: "destructive" as const };
      default: return { label: level, variant: "outline" as const };
    }
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-display font-bold text-foreground">인기 강좌</h2>
            <p className="text-muted-foreground mt-1">지금 가장 많은 학습자가 선택한 강좌</p>
          </div>
          <Link to="/courses">
            <Button variant="ghost" className="gap-1">
              전체 보기 <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(courses || []).map((course: any) => {
              const level = getLevelInfo(course.level);
              return (
                <Link key={course.id} to={`/courses/${course.id}`}>
                  <Card className="group overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 h-full">
                    <div className="aspect-video overflow-hidden bg-muted relative">
                      {course.thumbnail_url || course.videoThumbnail ? (
                        <img src={course.thumbnail_url || course.videoThumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                          <BookOpen className="h-12 w-12 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge variant={level.variant} className="text-xs">{level.label}</Badge>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-card-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">{course.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{course.description || "강의 설명이 곧 추가됩니다."}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-foreground">
                          {course.price > 0 ? `₩${course.price?.toLocaleString()}` : "무료"}
                        </span>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{course.duration_hours || 0}시간</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

// ─── AI Features Showcase ───
const AIFeaturesShowcase = () => (
  <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
    <div className="absolute inset-0 bg-grid-pattern opacity-5" />
    <div className="container mx-auto px-4 relative z-10 max-w-6xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Brain className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">AI Powered</span>
        </div>
        <h2 className="text-3xl font-display font-bold mb-3">
          <span className="text-gradient">10가지 AI 기능</span>으로 학습 혁신
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">최신 AI 기술로 학습 효율을 극대화합니다</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: Brain, title: "AI 튜터", desc: "24시간 질문 답변", tags: ["실시간", "맞춤형"] },
          { icon: CheckCircle2, title: "AI 자동 채점", desc: "과제 자동 채점 및 피드백", tags: ["즉시", "정확"] },
          { icon: BarChart3, title: "AI 학습 분석", desc: "패턴 분석 및 예측", tags: ["분석", "예측"] },
          { icon: Target, title: "AI 학습 경로", desc: "맞춤 학습 순서 추천", tags: ["개인화", "최적화"] },
          { icon: FileText, title: "AI 리포트", desc: "자동 분석 리포트 생성", tags: ["자동", "상세"] },
          { icon: MessageSquare, title: "AI 챗봇", desc: "실시간 학습 지원", tags: ["24/7", "대화형"] },
        ].map(({ icon: Icon, title, desc, tags }) => (
          <div key={title} className="group p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-card-foreground group-hover:text-primary transition-colors mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
                <div className="mt-2 flex gap-1.5">
                  {tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-8">
        <Link to="/ai-showcase">
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            모든 AI 기능 체험하기
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

// ─── Public CTA ───
const PublicCTA = () => (
  <section className="py-16">
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto text-center relative overflow-hidden rounded-2xl p-12 border border-primary/20 shadow-elegant">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="relative z-10">
          <h2 className="text-3xl font-display font-bold mb-4">지금 바로 시작하세요</h2>
          <p className="text-lg text-muted-foreground mb-8">첫 강의를 무료로 수강하고, AI의 힘을 경험해보세요.</p>
          <Link to="/auth">
            <Button size="lg" variant="premium" className="gap-2">
              <TrendingUp className="h-5 w-5" />
              무료로 시작하기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════
// ─── STUDENT HOME SECTION ───
// ═══════════════════════════════════════════════════════
const StudentHomeSection = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();

  const { data: enrollments } = useQuery({
    queryKey: ['studentEnrollments', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('enrollments')
        .select('*, courses(title, thumbnail_url, slug)')
        .eq('user_id', userId)
        .order('enrolled_at', { ascending: false })
        .limit(4);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: gamification } = useQuery({
    queryKey: ['studentGamification', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: recentBadges } = useQuery({
    queryKey: ['studentBadges', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_badges')
        .select('*, badges(*)')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })
        .limit(3);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: notifications } = useQuery({
    queryKey: ['studentNotifications', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: upcomingAssignments } = useQuery({
    queryKey: ['studentUpcomingAssignments', userId],
    queryFn: async () => {
      const enrollmentIds = enrollments?.map((e: any) => e.course_id) || [];
      if (enrollmentIds.length === 0) return [];
      const { data } = await supabase
        .from('assignments')
        .select('*')
        .in('course_id', enrollmentIds)
        .eq('status', 'published')
        .gte('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })
        .limit(3);
      return data || [];
    },
    enabled: !!enrollments && enrollments.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-8">
      {/* Welcome & Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20"><BookOpen className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{enrollments?.length || 0}</p>
              <p className="text-xs text-muted-foreground">수강중</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/20"><Trophy className="h-5 w-5 text-accent" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{gamification?.total_points || 0}</p>
              <p className="text-xs text-muted-foreground">포인트</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20"><Flame className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{gamification?.streak_days || 0}일</p>
              <p className="text-xs text-muted-foreground">연속 학습</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20"><Star className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">Lv.{gamification?.level || 1}</p>
              <p className="text-xs text-muted-foreground">현재 레벨</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 수강중인 강좌 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" /> 수강중인 강좌
            </h3>
            <Link to="/student/courses">
              <Button variant="ghost" size="sm" className="gap-1">전체 보기 <ChevronRight className="h-4 w-4" /></Button>
            </Link>
          </div>
          {enrollments && enrollments.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {enrollments.map((enrollment: any) => (
                <Card key={enrollment.id} className="group hover:shadow-md transition-all cursor-pointer" onClick={() => navigate(`/student/courses/${enrollment.course_id}`)}>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-1 mb-2">
                      {enrollment.courses?.title}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">진행률</span>
                        <span className="font-medium text-foreground">{Math.round(enrollment.progress || 0)}%</span>
                      </div>
                      <Progress value={enrollment.progress || 0} className="h-2" />
                    </div>
                    {enrollment.completed_at && (
                      <Badge variant="default" className="mt-2 text-xs">수료 완료</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-3">아직 수강중인 강좌가 없습니다</p>
              <Link to="/courses"><Button variant="premium" size="sm">강좌 둘러보기</Button></Link>
            </Card>
          )}

          {/* 마감 임박 과제 */}
          {upcomingAssignments && upcomingAssignments.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-3">
                <ClipboardCheck className="h-5 w-5 text-primary" /> 마감 임박 과제
              </h3>
              <div className="space-y-2">
                {upcomingAssignments.map((a: any) => (
                  <Card key={a.id} className="p-3 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('/student/assignments')}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-card-foreground text-sm">{a.title}</p>
                        <p className="text-xs text-muted-foreground">만점: {a.max_score}점</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(a.due_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 사이드바 */}
        <div className="space-y-4">
          {/* 알림 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" /> 알림
                {notifications && notifications.length > 0 && (
                  <Badge variant="destructive" className="text-xs ml-auto">{notifications.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {notifications && notifications.length > 0 ? (
                notifications.slice(0, 3).map((n: any) => (
                  <div key={n.id} className="p-2 rounded-lg bg-muted/50 text-sm">
                    <p className="font-medium text-card-foreground line-clamp-1">{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{n.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">새 알림이 없습니다</p>
              )}
            </CardContent>
          </Card>

          {/* 획득 배지 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4 text-accent" /> 최근 배지
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentBadges && recentBadges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {recentBadges.map((ub: any) => (
                    <Badge key={ub.id} variant="secondary" className="gap-1 text-xs">
                      <span>{ub.badges?.icon}</span> {ub.badges?.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">배지를 획득해보세요!</p>
              )}
              <Link to="/student/gamification" className="block mt-3">
                <Button variant="ghost" size="sm" className="w-full text-xs gap-1">
                  게이미피케이션 <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 빠른 바로가기 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" /> 바로가기
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {[
                { to: '/student/courses', icon: BookOpen, label: '내 강좌' },
                { to: '/student/assignments', icon: ClipboardCheck, label: '과제' },
                { to: '/student/community', icon: MessageSquare, label: '커뮤니티' },
                { to: '/student/analytics', icon: BarChart3, label: '학습분석' },
                { to: '/student/learning-path', icon: Target, label: '학습경로' },
                { to: '/student/points', icon: Trophy, label: '포인트' },
              ].map(({ to, icon: Icon, label }) => (
                <Link key={to} to={to}>
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-9 justify-start">
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// ─── TEACHER HOME SECTION ───
// ═══════════════════════════════════════════════════════
const TeacherHomeSection = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();

  const { data: courses } = useQuery({
    queryKey: ['teacherCourses', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', userId)
        .order('created_at', { ascending: false })
        .limit(4);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: pendingSubmissions } = useQuery({
    queryKey: ['teacherPendingSubmissions', userId],
    queryFn: async () => {
      const courseIds = courses?.map(c => c.id) || [];
      if (courseIds.length === 0) return [];
      const { data } = await supabase
        .from('assignment_submissions')
        .select('*, assignments(title, course_id)')
        .in('assignments.course_id' as any, courseIds)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false })
        .limit(5);
      return (data || []).filter((s: any) => s.assignments);
    },
    enabled: !!courses && courses.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const { data: studentCount } = useQuery({
    queryKey: ['teacherStudentCount', userId],
    queryFn: async () => {
      const courseIds = courses?.map(c => c.id) || [];
      if (courseIds.length === 0) return 0;
      const { count } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .in('course_id', courseIds);
      return count || 0;
    },
    enabled: !!courses && courses.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20"><Layers className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{courses?.length || 0}</p>
              <p className="text-xs text-muted-foreground">내 강좌</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/20"><Users className="h-5 w-5 text-accent" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{studentCount || 0}</p>
              <p className="text-xs text-muted-foreground">수강생</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/20"><ClipboardCheck className="h-5 w-5 text-orange-600" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingSubmissions?.length || 0}</p>
              <p className="text-xs text-muted-foreground">채점 대기</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20"><BookMarked className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{courses?.filter((c: any) => c.status === 'published').length || 0}</p>
              <p className="text-xs text-muted-foreground">게시됨</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 내 강좌 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" /> 내 강좌
            </h3>
            <Link to="/teacher/courses"><Button variant="ghost" size="sm" className="gap-1">전체 보기 <ChevronRight className="h-4 w-4" /></Button></Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {courses?.map((course: any) => (
              <Card key={course.id} className="group hover:shadow-md transition-all cursor-pointer" onClick={() => navigate(`/teacher/courses/${course.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-1">{course.title}</h4>
                    <Badge variant={course.status === 'published' ? 'default' : 'secondary'} className="text-xs ml-2 flex-shrink-0">
                      {course.status === 'published' ? '게시됨' : '준비중'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{course.description || "설명 없음"}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 채점 대기 */}
          {pendingSubmissions && pendingSubmissions.length > 0 && (
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-orange-500" /> 채점 대기 과제
              </h3>
              <div className="space-y-2">
                {pendingSubmissions.map((s: any) => (
                  <Card key={s.id} className="p-3 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('/teacher/assignments')}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{s.assignments?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          제출일: {new Date(s.submitted_at).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs text-orange-600">채점 필요</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 사이드바 */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" /> 바로가기
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {[
                { to: '/teacher/courses', icon: BookOpen, label: '강좌 관리' },
                { to: '/teacher/assignments', icon: ClipboardCheck, label: '과제 관리' },
                { to: '/teacher/students', icon: Users, label: '수강생' },
                { to: '/teacher/attendance', icon: UserCheck, label: '출석 관리' },
                { to: '/teacher/analytics', icon: BarChart3, label: '분석' },
                { to: '/teacher/revenue', icon: TrendingUp, label: '수익' },
                { to: '/teacher/training-log', icon: FileText, label: '훈련일지' },
                { to: '/teacher/counseling-log', icon: MessageSquare, label: '상담일지' },
              ].map(({ to, icon: Icon, label }) => (
                <Link key={to} to={to}>
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-9 justify-start">
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// ─── ADMIN HOME SECTION ───
// ═══════════════════════════════════════════════════════
const AdminHomeSection = () => {
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ['adminHomeStats'],
    queryFn: async () => {
      const [coursesRes, usersRes, enrollmentsRes, assignmentsRes] = await Promise.all([
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('enrollments').select('*', { count: 'exact', head: true }),
        supabase.from('assignment_submissions').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
      ]);
      return {
        courses: coursesRes.count || 0,
        users: usersRes.count || 0,
        enrollments: enrollmentsRes.count || 0,
        pendingGrading: assignmentsRes.count || 0,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['adminRecentActivity'],
    queryFn: async () => {
      const { data } = await supabase
        .from('enrollments')
        .select('*, courses(title), profiles!enrollments_user_id_fkey(full_name)')
        .order('enrolled_at', { ascending: false })
        .limit(5);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20"><BookOpen className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats?.courses || 0}</p>
              <p className="text-xs text-muted-foreground">전체 강좌</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/20"><Users className="h-5 w-5 text-accent" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats?.users || 0}</p>
              <p className="text-xs text-muted-foreground">전체 사용자</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20"><GraduationCap className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats?.enrollments || 0}</p>
              <p className="text-xs text-muted-foreground">수강 등록</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/20"><ClipboardCheck className="h-5 w-5 text-orange-600" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats?.pendingGrading || 0}</p>
              <p className="text-xs text-muted-foreground">채점 대기</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 최근 활동 */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-primary" /> 최근 수강 등록
          </h3>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentActivity?.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {(item as any).profiles?.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{(item as any).profiles?.full_name || '사용자'}</p>
                        <p className="text-xs text-muted-foreground">{item.courses?.title}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.enrolled_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                )) || (
                  <div className="p-8 text-center text-muted-foreground">최근 활동이 없습니다</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 관리 메뉴 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" /> 관리 메뉴
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {[
              { to: '/admin', icon: PieChart, label: '대시보드' },
              { to: '/admin/users', icon: Users, label: '사용자' },
              { to: '/admin/courses', icon: BookOpen, label: '강좌' },
              { to: '/admin/attendance', icon: UserCheck, label: '출석' },
              { to: '/admin/grades', icon: ClipboardCheck, label: '성적' },
              { to: '/admin/analytics', icon: BarChart3, label: '분석' },
              { to: '/admin/revenue', icon: TrendingUp, label: '매출' },
              { to: '/admin/settings', icon: Settings, label: '설정' },
              { to: '/admin/monitoring', icon: Monitor, label: '모니터링' },
              { to: '/admin/ai-logs', icon: Brain, label: 'AI 로그' },
            ].map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to}>
                <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-9 justify-start">
                  <Icon className="h-3.5 w-3.5" /> {label}
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// ─── OPERATOR HOME SECTION ───
// ═══════════════════════════════════════════════════════
const OperatorHomeSection = () => {
  const navigate = useNavigate();

  const { data: tenantStats } = useQuery({
    queryKey: ['operatorTenantStats'],
    queryFn: async () => {
      const [tenantsRes, contractsRes] = await Promise.all([
        supabase.from('tenants').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('contracts').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      ]);
      return {
        activeTenants: tenantsRes.count || 0,
        activeContracts: contractsRes.count || 0,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20"><Building2 className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{tenantStats?.activeTenants || 0}</p>
              <p className="text-xs text-muted-foreground">활성 고객사</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/20"><FileText className="h-5 w-5 text-accent" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{tenantStats?.activeContracts || 0}</p>
              <p className="text-xs text-muted-foreground">활성 계약</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20"><Shield className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">99.9%</p>
              <p className="text-xs text-muted-foreground">가동률</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20"><Megaphone className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">v2.0</p>
              <p className="text-xs text-muted-foreground">현재 버전</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" /> 운영 메뉴
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { to: '/operator', icon: PieChart, label: '대시보드' },
            { to: '/operator/tenants', icon: Building2, label: '고객사 관리' },
            { to: '/operator/contracts', icon: FileText, label: '계약 관리' },
            { to: '/operator/usage', icon: BarChart3, label: '사용량' },
            { to: '/operator/revenue', icon: TrendingUp, label: '매출' },
            { to: '/operator/monitoring', icon: Monitor, label: '모니터링' },
            { to: '/operator/ai-logs', icon: Brain, label: 'AI 로그' },
            { to: '/operator/settings', icon: Settings, label: '설정' },
          ].map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to}>
              <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-9 justify-start">
                <Icon className="h-3.5 w-3.5" /> {label}
              </Button>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// ─── MAIN HOMEPAGE COMPONENT ───
// ═══════════════════════════════════════════════════════
const HomePage = () => {
  const { user, role, loading } = useUser();
  const navigate = useNavigate();
  const isLoggedIn = !!user;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("로그아웃되었습니다");
    navigate('/');
  };

  const getRoleLabel = (r: string | null) => {
    switch (r) {
      case 'student': return '학습자';
      case 'teacher': return '강사';
      case 'admin': return '관리자';
      case 'operator': return '운영자';
      default: return '';
    }
  };

  const getRoleDashboardPath = (r: string | null) => {
    switch (r) {
      case 'student': return '/student';
      case 'teacher': return '/teacher';
      case 'admin': return '/admin';
      case 'operator': return '/operator';
      default: return '/';
    }
  };

  if (loading) {
    return <AtomSpinner />;
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Navigation Header */}
        <header className="border-b sticky top-0 bg-background/95 backdrop-blur-xl z-50 shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/home" className="flex items-center gap-2">
                    <img src={logoIcon} alt="Atom LMS" className="h-10 w-10" />
                    <span className="text-xl font-logo font-bold text-foreground tracking-tight">atomLMS</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-primary text-primary-foreground border-primary">
                  <p>홈으로 이동</p>
                </TooltipContent>
              </Tooltip>

              <nav className="hidden md:flex items-center gap-6">
                <Link to="/home" className="text-sm font-medium text-foreground hover:text-primary transition-colors">홈</Link>
                <Link to="/courses" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">강좌</Link>
                <Link to="/features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">기능</Link>
                {!isLoggedIn && (
                  <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">요금제</Link>
                )}
              </nav>

              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                {isLoggedIn ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="hidden sm:flex gap-1 text-xs">
                      <User className="h-3 w-3" />
                      {getRoleLabel(role)}
                    </Badge>
                    <Link to={getRoleDashboardPath(role)}>
                      <Button variant="outline" size="sm" className="gap-1 text-xs">
                        <Home className="h-3.5 w-3.5" /> 대시보드
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1 text-xs text-muted-foreground">
                      <LogOut className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link to="/auth">
                      <Button variant="ghost" size="sm">로그인</Button>
                    </Link>
                    <Link to="/auth">
                      <Button variant="premium" size="sm" className="gap-1">
                        <Sparkles className="h-3.5 w-3.5" /> 시작하기
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* AI Search */}
            {isLoggedIn && (
              <div className="flex justify-center mt-3 pb-1">
                <AISearchBar />
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main>
          {isLoggedIn ? (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
              {/* Role-specific welcome */}
              <div className="mb-8">
                <h1 className="text-2xl font-display font-bold text-foreground">
                  안녕하세요, {getRoleLabel(role)}님 👋
                </h1>
                <p className="text-muted-foreground mt-1">오늘도 좋은 하루 되세요!</p>
              </div>

              {/* Role-specific content */}
              {role === 'student' && <StudentHomeSection userId={user!.id} />}
              {role === 'teacher' && <TeacherHomeSection userId={user!.id} />}
              {role === 'admin' && <AdminHomeSection />}
              {role === 'operator' && <OperatorHomeSection />}
              {!role && (
                <Card className="p-8 text-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">역할이 아직 지정되지 않았습니다. 관리자에게 문의하세요.</p>
                </Card>
              )}
            </div>
          ) : (
            <>
              <PublicHeroSection />
              <PublicCourseGrid />
              <AIFeaturesShowcase />
              <PublicCTA />
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t py-10 bg-background mt-8">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <img src={logoIcon} alt="Atom LMS" className="h-8 w-8" />
                  <span className="text-lg font-logo font-bold">atomLMS</span>
                </div>
                <p className="text-sm text-muted-foreground">AI 기반 차세대 학습관리 플랫폼</p>
              </div>
              <nav>
                <h4 className="font-semibold mb-3 text-sm">제품</h4>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li><Link to="/features" className="hover:text-primary transition-colors">기능 소개</Link></li>
                  <li><Link to="/pricing" className="hover:text-primary transition-colors">요금제</Link></li>
                  <li><Link to="/ai-showcase" className="hover:text-primary transition-colors">AI 쇼케이스</Link></li>
                </ul>
              </nav>
              <nav>
                <h4 className="font-semibold mb-3 text-sm">학습</h4>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li><Link to="/courses" className="hover:text-primary transition-colors">전체 강좌</Link></li>
                  <li><Link to="/auth" className="hover:text-primary transition-colors">수강 신청</Link></li>
                </ul>
              </nav>
              <nav>
                <h4 className="font-semibold mb-3 text-sm">지원</h4>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li>이용약관</li>
                  <li>개인정보 처리방침</li>
                  <li>고객센터</li>
                </ul>
              </nav>
            </div>
            <Separator />
            <div className="pt-6 text-center text-xs text-muted-foreground">
              © 2025 atomLMS. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
};

export default HomePage;
