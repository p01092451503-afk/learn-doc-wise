import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Clock,
  TrendingUp,
  Target,
  Calendar,
  Award,
} from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";

const StudentAnalytics = () => {
  const [searchParams] = useSearchParams();
  const demoRole = searchParams.get('role') as "student" | "teacher" | "admin" | null;

  const weeklyActivity = [
    { day: "월", hours: 2.5 },
    { day: "화", hours: 3.0 },
    { day: "수", hours: 1.5 },
    { day: "목", hours: 4.0 },
    { day: "금", hours: 2.0 },
    { day: "토", hours: 3.5 },
    { day: "일", hours: 2.5 },
  ];

  const courseProgress = [
    { name: "React 완벽 가이드", progress: 65, color: "bg-primary" },
    { name: "파이썬 데이터 분석", progress: 40, color: "bg-accent" },
    { name: "디자인 시스템 구축", progress: 25, color: "bg-secondary" },
  ];

  const recentScores = [
    { assignment: "React Hooks 퀴즈", score: 95, date: "2025-10-28" },
    { assignment: "Pandas 실습", score: 88, date: "2025-10-25" },
    { assignment: "컴포넌트 설계", score: 92, date: "2025-10-20" },
  ];

  const maxHours = Math.max(...weeklyActivity.map((d) => d.hours));

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">학습 통계</h1>
          <p className="text-muted-foreground mt-2">
            나의 학습 활동과 성과를 확인하세요
          </p>
        </div>

        {/* 주요 지표 */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    이번 주 학습
                  </p>
                  <p className="text-3xl font-bold mt-2 whitespace-nowrap">19시간</p>
                  <p className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
                    지난 주 대비 +15%
                  </p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    평균 점수
                  </p>
                  <p className="text-3xl font-bold mt-2 whitespace-nowrap">92점</p>
                  <p className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
                    전체 평균: 85점
                  </p>
                </div>
                <div className="h-12 w-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    완료율
                  </p>
                  <p className="text-3xl font-bold mt-2 whitespace-nowrap">68%</p>
                  <p className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
                    28/41 레슨 완료
                  </p>
                </div>
                <div className="h-12 w-12 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    획득 뱃지
                  </p>
                  <p className="text-3xl font-bold mt-2 whitespace-nowrap">7개</p>
                  <p className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
                    다음 뱃지까지 3일
                  </p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 주간 학습 활동 */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                주간 학습 활동
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyActivity.map((item) => (
                  <div key={item.day} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.day}요일</span>
                      <span className="text-muted-foreground">
                        {item.hours}시간
                      </span>
                    </div>
                    <div className="relative h-3 bg-muted rounded-lg overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary-glow rounded-lg transition-all duration-300"
                        style={{
                          width: `${(item.hours / maxHours) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 강의별 진행률 */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                강의별 진행률
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {courseProgress.map((course) => (
                <div key={course.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{course.name}</span>
                    <span className="text-muted-foreground">
                      {course.progress}%
                    </span>
                  </div>
                  <Progress value={course.progress} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 최근 성적 */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              최근 성적
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentScores.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium">{item.assignment}</p>
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {item.score}점
                    </p>
                    <p className="text-xs text-muted-foreground">100점 만점</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentAnalytics;
