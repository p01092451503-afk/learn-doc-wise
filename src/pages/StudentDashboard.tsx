import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { BookOpen, Clock, Award, TrendingUp, PlayCircle, FileText, Brain, Sparkles, Route, FileQuestion, Users } from "lucide-react";
import atomLogo from "@/assets/atom-logo.png";
import { Chatbot } from "@/components/Chatbot";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/i18n/translations";
import { AILearningPathDialog } from "@/components/ai/AILearningPathDialog";
import { AIQuizDialog } from "@/components/ai/AIQuizDialog";
import { AISummaryDialog } from "@/components/ai/AISummaryDialog";
import { AIProgressDialog } from "@/components/ai/AIProgressDialog";
import { AIStudyMatchDialog } from "@/components/ai/AIStudyMatchDialog";

const StudentDashboard = ({ isDemo = false }: { isDemo?: boolean }) => {
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(language, key);
  
  const [learningPathOpen, setLearningPathOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [studyMatchOpen, setStudyMatchOpen] = useState(false);
  
  return (
    <DashboardLayout userRole="student" isDemo={isDemo}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-2">
              <span className="text-gradient">{t('learningDashboard')}</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base lg:text-lg flex items-center gap-2">
              <img src={atomLogo} alt="atom" className="h-5 w-5 md:h-6 md:w-6" />
              <span className="hidden sm:inline">{language === 'ko' ? '안녕하세요! ' : 'Hello! '}</span>
              {isDemo ? t('aiLearningMessage') : t('welcomeMessage')}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title={t('enrolledCourses')}
            value="5"
            icon={<BookOpen className="h-5 w-5" />}
            description="+2 this month"
          />
          <StatsCard
            title={t('learningTime')}
            value="24.5h"
            icon={<Clock className="h-5 w-5" />}
            description={t('thisWeek')}
          />
          <StatsCard
            title={t('completedAssignments')}
            value="12"
            icon={<FileText className="h-5 w-5" />}
            description={`${t('outOf')} 15${t('of')}`}
          />
          <StatsCard
            title={t('earnedBadges')}
            value="8"
            icon={<Award className="h-5 w-5" />}
            description="+3 new"
          />
        </div>

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

                <div className="p-4 rounded-lg bg-background border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
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
                </div>
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
        {getTranslation('ko', 'continue')}
      </Button>
    </div>
    <div>
      <div className="flex justify-between mb-2 text-xs md:text-sm">
        <span className="text-muted-foreground">{getTranslation('ko', 'progress')}</span>
        <span className="font-semibold text-primary">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
    <p className="text-xs md:text-sm text-muted-foreground truncate">{getTranslation('ko', 'nextLesson')}: {nextLesson}</p>
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
    <Button size="sm" className="w-full sm:w-auto flex-shrink-0">{getTranslation('ko', 'viewDetails')}</Button>
  </div>
);

export default StudentDashboard;
