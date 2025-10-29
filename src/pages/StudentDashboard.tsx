import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { BookOpen, Clock, Award, TrendingUp, PlayCircle, FileText } from "lucide-react";

const StudentDashboard = () => {
  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">학습 대시보드</h1>
          <p className="text-muted-foreground">안녕하세요! 오늘도 열심히 학습해봅시다 🎓</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="수강 중인 강의"
            value="5"
            icon={<BookOpen className="h-4 w-4" />}
            description="+2 this month"
          />
          <StatsCard
            title="학습 시간"
            value="24.5h"
            icon={<Clock className="h-4 w-4" />}
            description="이번 주"
          />
          <StatsCard
            title="완료한 과제"
            value="12"
            icon={<FileText className="h-4 w-4" />}
            description="전체 15개 중"
          />
          <StatsCard
            title="획득 뱃지"
            value="8"
            icon={<Award className="h-4 w-4" />}
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
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const CourseProgress = ({ title, instructor, progress, nextLesson }: { title: string; instructor: string; progress: number; nextLesson: string }) => (
  <div className="space-y-2 p-4 rounded-lg border hover:border-primary/50 transition-colors">
    <div className="flex justify-between items-start">
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-muted-foreground">{instructor}</p>
      </div>
      <Button size="sm" variant="outline">
        <PlayCircle className="h-4 w-4 mr-1" />
        계속하기
      </Button>
    </div>
    <div>
      <div className="flex justify-between mb-1 text-sm">
        <span className="text-muted-foreground">진행률</span>
        <span className="font-medium">{progress}%</span>
      </div>
      <Progress value={progress} />
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
