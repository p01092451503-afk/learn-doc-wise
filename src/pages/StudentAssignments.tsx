import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";

const StudentAssignments = () => {
  const pendingAssignments = [
    {
      id: 1,
      title: "React Hooks 실습 과제",
      course: "React 완벽 가이드",
      dueDate: "2025-11-05",
      daysLeft: 3,
      points: 100,
      status: "urgent",
    },
    {
      id: 2,
      title: "데이터 시각화 프로젝트",
      course: "파이썬 데이터 분석",
      dueDate: "2025-11-10",
      daysLeft: 8,
      points: 150,
      status: "normal",
    },
    {
      id: 3,
      title: "컴포넌트 라이브러리 구축",
      course: "디자인 시스템 구축",
      dueDate: "2025-11-15",
      daysLeft: 13,
      points: 200,
      status: "normal",
    },
  ];

  const completedAssignments = [
    {
      id: 4,
      title: "JavaScript 기초 퀴즈",
      course: "React 완벽 가이드",
      submittedDate: "2025-10-25",
      score: 95,
      points: 50,
    },
    {
      id: 5,
      title: "Pandas 데이터 분석",
      course: "파이썬 데이터 분석",
      submittedDate: "2025-10-20",
      score: 88,
      points: 100,
    },
  ];

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">과제</h1>
          <p className="text-muted-foreground mt-2">
            제출할 과제를 확인하고 관리하세요
          </p>
        </div>

        {/* 과제 통계 */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    제출 대기
                  </p>
                  <p className="text-3xl font-bold mt-2">3</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    완료한 과제
                  </p>
                  <p className="text-3xl font-bold mt-2">12</p>
                </div>
                <div className="h-12 w-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    평균 점수
                  </p>
                  <p className="text-3xl font-bold mt-2">92점</p>
                </div>
                <div className="h-12 w-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    긴급 과제
                  </p>
                  <p className="text-3xl font-bold mt-2 text-destructive">1</p>
                </div>
                <div className="h-12 w-12 bg-destructive/10 rounded-xl flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 과제 목록 */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="pending">제출 대기</TabsTrigger>
            <TabsTrigger value="completed">완료됨</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6 space-y-4">
            {pendingAssignments.map((assignment) => (
              <Card
                key={assignment.id}
                className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {assignment.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {assignment.course}
                      </p>
                    </div>
                    <Badge
                      variant={
                        assignment.status === "urgent" ? "destructive" : "secondary"
                      }
                    >
                      {assignment.status === "urgent" ? "긴급" : "진행중"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className={assignment.status === "urgent" ? "text-destructive font-medium" : ""}>
                          {assignment.daysLeft}일 남음 (마감: {assignment.dueDate})
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        배점: {assignment.points}점
                      </div>
                    </div>
                    <Button>과제 제출하기</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="completed" className="mt-6 space-y-4">
            {completedAssignments.map((assignment) => (
              <Card
                key={assignment.id}
                className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {assignment.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {assignment.course}
                      </p>
                    </div>
                    <Badge variant="default" className="bg-accent">
                      {assignment.score}점
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>제출일: {assignment.submittedDate}</span>
                      </div>
                      <div>배점: {assignment.points}점</div>
                    </div>
                    <Button variant="outline">상세 보기</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default StudentAssignments;
