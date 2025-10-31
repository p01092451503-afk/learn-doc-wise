import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { BookOpen, Clock, Award, TrendingUp, PlayCircle, FileText, Brain, Sparkles } from "lucide-react";
import atomLogo from "@/assets/atom-logo.png";
import { Chatbot } from "@/components/Chatbot";

const StudentDashboard = ({ isDemo = false }: { isDemo?: boolean }) => {
  return (
    <DashboardLayout userRole="student" isDemo={isDemo}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-2">
              <span className="text-gradient">학습 대시보드</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base lg:text-lg flex items-center gap-2">
              <img src={atomLogo} alt="atom" className="h-5 w-5 md:h-6 md:w-6" />
              <span className="hidden sm:inline">안녕하세요! </span>
              {isDemo ? 'AI 기반 맞춤형 학습으로 더 빠르게 성장하세요' : '오늘도 열심히 학습해봅시다'}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="수강 중인 강의"
            value="5"
            icon={<BookOpen className="h-5 w-5" />}
            description="+2 this month"
          />
          <StatsCard
            title="학습 시간"
            value="24.5h"
            icon={<Clock className="h-5 w-5" />}
            description="이번 주"
          />
          <StatsCard
            title="완료한 과제"
            value="12"
            icon={<FileText className="h-5 w-5" />}
            description="전체 15개 중"
          />
          <StatsCard
            title="획득 뱃지"
            value="8"
            icon={<Award className="h-5 w-5" />}
            description="+3 new"
          />
        </div>

        {/* Current Courses */}
        <Card>
          <CardHeader>
            <CardTitle>진행 중인 강의</CardTitle>
            <CardDescription>계속해서 학습을 진행하세요</CardDescription>
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
                학습 통계
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">주간 목표</span>
                    <span className="text-sm font-medium">15h / 20h</span>
                  </div>
                  <Progress value={75} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">과제 완료율</span>
                    <span className="text-sm font-medium">80%</span>
                  </div>
                  <Progress value={80} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">평균 점수</span>
                    <span className="text-sm font-medium">92점</span>
                  </div>
                  <Progress value={92} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                추천 강의
                {isDemo && <Badge variant="default" className="text-xs">AI 추천</Badge>}
              </CardTitle>
              <CardDescription>AI가 당신의 학습 패턴을 분석하여 추천합니다</CardDescription>
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

        {/* AI Features Section - Demo Mode Only */}
        {isDemo && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI 학습 도우미 기능
                <Badge variant="default" className="text-xs">AI</Badge>
              </CardTitle>
              <CardDescription>
                AI 기술로 더 효과적인 학습을 경험하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-background border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-semibold">AI 튜터</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    24시간 언제든지 질문하고 실시간 답변을 받으세요
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-semibold">AI 자동 채점</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    과제 제출 시 즉시 채점 결과와 상세한 피드백 제공
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-semibold">AI 학습 분석</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    학습 패턴 분석으로 맞춤형 학습 경로 추천
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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

const CourseProgress = ({ title, instructor, progress, nextLesson }: { title: string; instructor: string; progress: number; nextLesson: string }) => (
  <div className="space-y-3 p-4 md:p-5 rounded-2xl border border-border/50 hover:border-primary/50 hover:shadow-premium transition-all duration-300 card-premium">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div className="flex-1 min-w-0">
        <h4 className="font-display font-semibold text-base md:text-lg truncate">{title}</h4>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">{instructor}</p>
      </div>
      <Button size="sm" variant="outline" className="rounded-xl w-full sm:w-auto flex-shrink-0">
        <PlayCircle className="h-4 w-4 mr-1" />
        계속하기
      </Button>
    </div>
    <div>
      <div className="flex justify-between mb-2 text-xs md:text-sm">
        <span className="text-muted-foreground">진행률</span>
        <span className="font-semibold text-primary">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
    <p className="text-xs md:text-sm text-muted-foreground truncate">다음: {nextLesson}</p>
  </div>
);

const RecommendedCourse = ({ title, instructor, rating, students }: { title: string; instructor: string; rating: number; students: number }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer">
    <div className="flex-1 min-w-0">
      <h4 className="font-medium text-sm truncate">{title}</h4>
      <p className="text-xs text-muted-foreground truncate">{instructor}</p>
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        <span className="text-xs">⭐ {rating}</span>
        <span className="text-xs text-muted-foreground">· {students.toLocaleString()} 수강생</span>
      </div>
    </div>
    <Button size="sm" className="w-full sm:w-auto flex-shrink-0">보기</Button>
  </div>
);

export default StudentDashboard;
