import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { 
  ArrowLeft, 
  BookOpen, 
  TrendingUp, 
  Award, 
  Mail, 
  CheckCircle2,
  Clock,
  FileText,
  Calendar
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const TeacherStudentDetail = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { studentId } = useParams();

  // Mock student data
  const student = {
    id: studentId,
    name: "김철수",
    email: "kim@example.com",
    enrolledDate: "2024-01-15",
    lastActive: "2시간 전",
    status: "active",
    totalCourses: 3,
    completedCourses: 2,
    averageProgress: 85,
    totalAssignments: 12,
    submittedAssignments: 10,
    averageScore: 92,
  };

  const completedCourses = [
    {
      id: 1,
      title: "React 기초",
      completedDate: "2024-03-15",
      finalScore: 95,
      duration: "8주",
      certificateIssued: true,
    },
    {
      id: 2,
      title: "JavaScript ES6+",
      completedDate: "2024-02-28",
      finalScore: 88,
      duration: "6주",
      certificateIssued: true,
    },
  ];

  const inProgressCourses = [
    {
      id: 3,
      title: "TypeScript 마스터",
      progress: 65,
      lastAccessed: "2시간 전",
      nextDeadline: "2024-04-15",
    },
  ];

  const assignmentSubmissions = [
    {
      id: 1,
      title: "React Hooks 과제",
      course: "React 기초",
      submittedDate: "2024-03-10",
      score: 95,
      status: "graded",
      feedback: "훌륭한 과제입니다!",
    },
    {
      id: 2,
      title: "Component 설계",
      course: "React 기초",
      submittedDate: "2024-03-05",
      score: 92,
      status: "graded",
      feedback: "잘 작성했습니다.",
    },
    {
      id: 3,
      title: "TypeScript 기초 실습",
      course: "TypeScript 마스터",
      submittedDate: "2024-04-01",
      score: null,
      status: "pending",
      feedback: null,
    },
    {
      id: 4,
      title: "비동기 프로그래밍",
      course: "JavaScript ES6+",
      submittedDate: "2024-02-25",
      score: 88,
      status: "graded",
      feedback: "좋은 이해도를 보여줍니다.",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "graded":
        return <Badge variant="default">채점 완료</Badge>;
      case "pending":
        return <Badge variant="secondary">채점 대기</Badge>;
      case "late":
        return <Badge variant="destructive">지연 제출</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout userRole="teacher">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/teacher/students")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">
                  {student.name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  {student.name}
                </h1>
                <p className="text-muted-foreground">{student.email}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    등록일: {student.enrolledDate}
                  </span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    최근 활동: {student.lastActive}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <Button className="gap-2">
            <Mail className="h-4 w-4" />
            메시지 보내기
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title="수강 중인 강의"
            value={student.totalCourses}
            icon={<BookOpen className="h-4 w-4" />}
            description={`${student.completedCourses}개 완료`}
          />
          <StatsCard
            title="평균 진행률"
            value={`${student.averageProgress}%`}
            icon={<TrendingUp className="h-4 w-4" />}
            description="전체 강의 기준"
          />
          <StatsCard
            title="과제 제출률"
            value={`${Math.round((student.submittedAssignments / student.totalAssignments) * 100)}%`}
            icon={<FileText className="h-4 w-4" />}
            description={`${student.submittedAssignments}/${student.totalAssignments} 제출`}
          />
          <StatsCard
            title="평균 점수"
            value={`${student.averageScore}점`}
            icon={<Award className="h-4 w-4" />}
            description="우수한 성적"
          />
        </div>

        {/* In Progress Courses */}
        <Card>
          <CardHeader>
            <CardTitle>수강 중인 강의</CardTitle>
            <CardDescription>현재 학습 중인 강의 목록</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inProgressCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">{course.title}</h4>
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-sm text-muted-foreground">
                        최근 접속: {course.lastAccessed}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        다음 마감일: {course.nextDeadline}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={course.progress} className="flex-1" />
                      <span className="text-sm font-medium">{course.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Completed Courses */}
        <Card>
          <CardHeader>
            <CardTitle>완료한 강의</CardTitle>
            <CardDescription>학생이 수료한 강의 목록</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>강의명</TableHead>
                  <TableHead className="text-center">수료일</TableHead>
                  <TableHead className="text-center">학습 기간</TableHead>
                  <TableHead className="text-center">최종 점수</TableHead>
                  <TableHead className="text-center">수료증</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell className="text-center">{course.completedDate}</TableCell>
                    <TableCell className="text-center">{course.duration}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="default">{course.finalScore}점</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {course.certificateIssued ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground text-sm">미발급</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Assignment Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>과제 제출 내역</CardTitle>
            <CardDescription>학생의 과제 제출 및 채점 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>과제명</TableHead>
                  <TableHead>강의</TableHead>
                  <TableHead className="text-center">제출일</TableHead>
                  <TableHead className="text-center">점수</TableHead>
                  <TableHead className="text-center">상태</TableHead>
                  <TableHead>피드백</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignmentSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.title}</TableCell>
                    <TableCell>{submission.course}</TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {submission.submittedDate}
                    </TableCell>
                    <TableCell className="text-center">
                      {submission.score ? (
                        <Badge variant={submission.score >= 90 ? "default" : "secondary"}>
                          {submission.score}점
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(submission.status)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {submission.feedback || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
  value: string | number; 
  icon: React.ReactNode; 
  description: string; 
}) => (
  <Card className="overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium whitespace-nowrap">{title}</CardTitle>
      <div className="text-muted-foreground flex-shrink-0">{icon}</div>
    </CardHeader>
    <CardContent className="space-y-1 min-w-0">
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground whitespace-nowrap">{description}</p>
    </CardContent>
  </Card>
);

export default TeacherStudentDetail;
