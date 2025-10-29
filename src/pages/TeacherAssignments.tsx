import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { FileText, Clock, CheckCircle, AlertCircle, Plus, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TeacherAssignments = () => {
  const assignments = [
    {
      id: 1,
      title: "React 컴포넌트 설계 과제",
      course: "React 완벽 가이드",
      dueDate: "2024-11-05",
      submitted: 89,
      total: 145,
      pending: 12,
      graded: 77,
      status: "active",
    },
    {
      id: 2,
      title: "TypeScript 타입 시스템 실습",
      course: "TypeScript 마스터클래스",
      dueDate: "2024-11-08",
      submitted: 65,
      total: 98,
      pending: 15,
      graded: 50,
      status: "active",
    },
    {
      id: 3,
      title: "Next.js 라우팅 프로젝트",
      course: "Next.js 풀스택 개발",
      dueDate: "2024-11-12",
      submitted: 45,
      total: 76,
      pending: 8,
      graded: 37,
      status: "active",
    },
    {
      id: 4,
      title: "상태 관리 구현",
      course: "React 완벽 가이드",
      dueDate: "2024-10-28",
      submitted: 145,
      total: 145,
      pending: 0,
      graded: 145,
      status: "closed",
    },
  ];

  const recentSubmissions = [
    {
      id: 1,
      student: "김철수",
      assignment: "React 컴포넌트 설계 과제",
      submittedAt: "2024-10-28 14:30",
      status: "pending",
    },
    {
      id: 2,
      student: "이영희",
      assignment: "TypeScript 타입 시스템 실습",
      submittedAt: "2024-10-28 13:45",
      status: "pending",
    },
    {
      id: 3,
      student: "박지민",
      assignment: "Next.js 라우팅 프로젝트",
      submittedAt: "2024-10-28 11:20",
      status: "pending",
    },
  ];

  return (
    <DashboardLayout userRole="teacher">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">과제 관리</h1>
            <p className="text-muted-foreground">
              과제를 생성하고 학생들의 제출물을 평가하세요
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            새 과제 만들기
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title="전체 과제"
            value="24"
            icon={<FileText className="h-4 w-4" />}
            description="4 활성 과제"
          />
          <StatsCard
            title="채점 대기"
            value="35"
            icon={<Clock className="h-4 w-4" />}
            description="검토 필요"
          />
          <StatsCard
            title="채점 완료"
            value="309"
            icon={<CheckCircle className="h-4 w-4" />}
            description="이번 달"
          />
          <StatsCard
            title="마감 임박"
            value="2"
            icon={<AlertCircle className="h-4 w-4" />}
            description="3일 이내"
          />
        </div>

        {/* Active Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>활성 과제</CardTitle>
            <CardDescription>현재 진행중인 과제 목록</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>과제명</TableHead>
                  <TableHead>강의</TableHead>
                  <TableHead>마감일</TableHead>
                  <TableHead className="text-center">제출률</TableHead>
                  <TableHead className="text-center">채점 대기</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {assignment.course}
                    </TableCell>
                    <TableCell className="text-sm">{assignment.dueDate}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-medium">
                          {assignment.submitted}/{assignment.total}
                        </span>
                        <div className="w-16 bg-secondary rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{
                              width: `${(assignment.submitted / assignment.total) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{assignment.pending}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={assignment.status === "active" ? "default" : "secondary"}
                      >
                        {assignment.status === "active" ? "진행중" : "마감"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          보기
                        </Button>
                        <Button size="sm">채점하기</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>최근 제출</CardTitle>
            <CardDescription>가장 최근에 제출된 과제</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-primary">
                        {submission.student[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{submission.student}</p>
                      <p className="text-sm text-muted-foreground">
                        {submission.assignment}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        제출: {submission.submittedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">채점 대기</Badge>
                    <Button size="sm">채점하기</Button>
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

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  description 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  description: string; 
}) => (
  <Card className="overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium whitespace-nowrap">{title}</CardTitle>
      <div className="text-muted-foreground flex-shrink-0">{icon}</div>
    </CardHeader>
    <CardContent className="space-y-1 min-w-0">
      <div className="text-xl font-bold break-all">{value}</div>
      <p className="text-xs text-muted-foreground whitespace-nowrap">{description}</p>
    </CardContent>
  </Card>
);

export default TeacherAssignments;
