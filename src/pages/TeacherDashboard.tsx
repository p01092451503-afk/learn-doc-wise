import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Users, BookOpen, DollarSign, TrendingUp, Plus, Eye, Edit, Brain, Sparkles, FileQuestion, FileText } from "lucide-react";
import atomLogo from "@/assets/atom-logo.png";
import { AIQuizDialog } from "@/components/ai/AIQuizDialog";
import { AISummaryDialog } from "@/components/ai/AISummaryDialog";

const TeacherDashboard = ({ isDemo = false }: { isDemo?: boolean }) => {
  const [quizOpen, setQuizOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  return (
    <DashboardLayout userRole="teacher" isDemo={isDemo}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">강사 대시보드</h1>
            <p className="text-sm md:text-base text-muted-foreground flex items-center gap-2">
              <img src={atomLogo} alt="atom" className="h-5 w-5" />
              {isDemo ? 'AI 기반 과제 채점으로 더 효율적인 강의 운영을 경험하세요' : '학생들의 학습을 관리하고 분석하세요'}
            </p>
          </div>
          <Button className="gap-2 w-full sm:w-auto flex-shrink-0">
            <Plus className="h-4 w-4" />
            새 강의 만들기
          </Button>
        </div>

        {/* Stats Cards */}
        <div className={`grid gap-4 md:grid-cols-2 ${isDemo ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
          <StatsCard
            title="전체 학생"
            value="342"
            icon={<Users className="h-4 w-4" />}
            description="+12% from last month"
            trend="up"
          />
          <StatsCard
            title="활성 강의"
            value="8"
            icon={<BookOpen className="h-4 w-4" />}
            description="2 pending review"
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
            title="이번 달 수익"
            value="₩4,250,000"
            icon={<DollarSign className="h-4 w-4" />}
            description="+18% from last month"
            trend="up"
          />
          <StatsCard
            title="평균 평점"
            value="4.8"
            icon={<TrendingUp className="h-4 w-4" />}
            description="Based on 156 reviews"
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
              <CourseItem
                title="React 완벽 가이드"
                students={145}
                rating={4.9}
                revenue="₩1,450,000"
                status="active"
              />
              <CourseItem
                title="TypeScript 마스터클래스"
                students={98}
                rating={4.7}
                revenue="₩980,000"
                status="active"
              />
              <CourseItem
                title="Next.js 풀스택 개발"
                students={76}
                rating={4.8}
                revenue="₩760,000"
                status="active"
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Features for Teachers */}
        {isDemo && (
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
                <div className="grid gap-4 md:grid-cols-2">
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
        )}

        {/* Recent Activity & Revenue Chart */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>최근 활동</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ActivityItem
                  student="김철수"
                  action="과제 제출"
                  course="React 완벽 가이드"
                  time="10분 전"
                />
                <ActivityItem
                  student="이영희"
                  action="새 질문 등록"
                  course="TypeScript 마스터클래스"
                  time="25분 전"
                />
                <ActivityItem
                  student="박지민"
                  action="강의 완료"
                  course="Next.js 풀스택 개발"
                  time="1시간 전"
                />
                <ActivityItem
                  student="정민수"
                  action="과제 제출"
                  course="React 완벽 가이드"
                  time="2시간 전"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>수익 통계</CardTitle>
              <CardDescription>최근 6개월</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">10월</span>
                  <span className="font-medium">₩4,250,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">9월</span>
                  <span className="font-medium">₩3,600,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">8월</span>
                  <span className="font-medium">₩3,200,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">7월</span>
                  <span className="font-medium">₩2,950,000</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Dialogs */}
        <AIQuizDialog open={quizOpen} onOpenChange={setQuizOpen} />
        <AISummaryDialog open={summaryOpen} onOpenChange={setSummaryOpen} />
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
  status 
}: { 
  title: string; 
  students: number; 
  rating: number; 
  revenue: string; 
  status: string;
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
      <Button size="sm" variant="outline" className="flex-1 sm:flex-none">
        <Eye className="h-4 w-4 mr-1" />
        보기
      </Button>
      <Button size="sm" variant="outline" className="flex-1 sm:flex-none">
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
