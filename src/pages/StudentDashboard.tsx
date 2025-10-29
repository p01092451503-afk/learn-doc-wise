import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { BookOpen, Clock, Award, TrendingUp, PlayCircle, FileText } from "lucide-react";
import atomLogo from "@/assets/atom-logo.png";

const StudentDashboard = ({ isDemo = false }: { isDemo?: boolean }) => {
  return (
    <DashboardLayout userRole="student" isDemo={isDemo}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">
              <span className="text-gradient">학습 대시보드</span>
            </h1>
            <p className="text-muted-foreground text-lg flex items-center gap-2">
              <img src={atomLogo} alt="atom" className="h-6 w-6" />
              안녕하세요! 오늘도 열심히 학습해봅시다
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
              <CardTitle>추천 강의</CardTitle>
              <CardDescription>AI가 추천하는 다음 강의</CardDescription>
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
      </div>
    </DashboardLayout>
  );
};

const StatsCard = ({ title, value, icon, description }: { title: string; value: string; icon: React.ReactNode; description: string }) => (
  <Card className="card-premium border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground whitespace-nowrap">{title}</CardTitle>
      <div className="text-primary p-2 bg-primary/10 rounded-xl flex-shrink-0">{icon}</div>
    </CardHeader>
    <CardContent className="space-y-1">
      <div className="text-3xl font-display font-bold text-gradient break-words overflow-hidden">{value}</div>
      <p className="text-xs text-muted-foreground break-words">{description}</p>
    </CardContent>
  </Card>
);

const CourseProgress = ({ title, instructor, progress, nextLesson }: { title: string; instructor: string; progress: number; nextLesson: string }) => (
  <div className="space-y-3 p-5 rounded-2xl border border-border/50 hover:border-primary/50 hover:shadow-premium transition-all duration-300 card-premium">
    <div className="flex justify-between items-start">
      <div>
        <h4 className="font-display font-semibold text-lg">{title}</h4>
        <p className="text-sm text-muted-foreground mt-1">{instructor}</p>
      </div>
      <Button size="sm" variant="outline" className="rounded-xl">
        <PlayCircle className="h-4 w-4 mr-1" />
        계속하기
      </Button>
    </div>
    <div>
      <div className="flex justify-between mb-2 text-sm">
        <span className="text-muted-foreground">진행률</span>
        <span className="font-semibold text-primary">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
    <p className="text-sm text-muted-foreground">다음: {nextLesson}</p>
  </div>
);

const RecommendedCourse = ({ title, instructor, rating, students }: { title: string; instructor: string; rating: number; students: number }) => (
  <div className="flex justify-between items-center p-3 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer">
    <div>
      <h4 className="font-medium text-sm">{title}</h4>
      <p className="text-xs text-muted-foreground">{instructor}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs">⭐ {rating}</span>
        <span className="text-xs text-muted-foreground">· {students.toLocaleString()} 수강생</span>
      </div>
    </div>
    <Button size="sm">보기</Button>
  </div>
);

export default StudentDashboard;
