import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Users, BookOpen, TrendingUp, Award, Mail, MoreVertical, Eye, MessageSquare, BarChart3 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const TeacherStudents = () => {
  const { toast } = useToast();
  
  const handleStudentAction = (studentName: string, action: string) => {
    toast({
      title: "데모 모드",
      description: `${studentName}의 ${action} 기능은 실제 서비스에서 사용할 수 있습니다.`,
    });
  };

  const students = [
    {
      id: 1,
      name: "김철수",
      email: "kim@example.com",
      courses: 3,
      progress: 85,
      lastActive: "2시간 전",
      status: "active",
      completionRate: 92,
    },
    {
      id: 2,
      name: "이영희",
      email: "lee@example.com",
      courses: 2,
      progress: 65,
      lastActive: "1일 전",
      status: "active",
      completionRate: 78,
    },
    {
      id: 3,
      name: "박지민",
      email: "park@example.com",
      courses: 4,
      progress: 95,
      lastActive: "30분 전",
      status: "active",
      completionRate: 98,
    },
    {
      id: 4,
      name: "정민수",
      email: "jung@example.com",
      courses: 1,
      progress: 45,
      lastActive: "3일 전",
      status: "inactive",
      completionRate: 45,
    },
    {
      id: 5,
      name: "최수진",
      email: "choi@example.com",
      courses: 2,
      progress: 78,
      lastActive: "5시간 전",
      status: "active",
      completionRate: 85,
    },
  ];

  return (
    <DashboardLayout userRole="teacher">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Users className="h-7 w-7 text-primary" />
              학생 관리
            </h1>
            <p className="text-muted-foreground">
              학생들의 학습 진행 상황과 활동을 모니터링하세요
            </p>
          </div>
          <Button className="gap-2">
            <Mail className="h-4 w-4" />
            전체 메시지 보내기
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title="전체 학생"
            value="342"
            icon={<Users className="h-4 w-4" />}
            description="+12% from last month"
          />
          <StatsCard
            title="활성 학생"
            value="298"
            icon={<TrendingUp className="h-4 w-4" />}
            description="87% 활동률"
          />
          <StatsCard
            title="평균 진행률"
            value="76%"
            icon={<BookOpen className="h-4 w-4" />}
            description="전체 강의 기준"
          />
          <StatsCard
            title="우수 학생"
            value="45"
            icon={<Award className="h-4 w-4" />}
            description="90% 이상 완료"
          />
        </div>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>학생 목록</CardTitle>
            <CardDescription>학생들의 상세 학습 현황을 확인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>학생</TableHead>
                  <TableHead className="text-center">수강 강의</TableHead>
                  <TableHead className="text-center">평균 진행률</TableHead>
                  <TableHead className="text-center">완료율</TableHead>
                  <TableHead>최근 활동</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {student.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{student.courses}개</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{student.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={student.completionRate >= 80 ? "default" : "secondary"}
                      >
                        {student.completionRate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {student.lastActive}
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.status === "active" ? "default" : "secondary"}>
                        {student.status === "active" ? "활성" : "비활성"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStudentAction(student.name, "상세 정보 보기")}>
                            <Eye className="mr-2 h-4 w-4" />
                            상세 정보 보기
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStudentAction(student.name, "메시지 보내기")}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            메시지 보내기
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStudentAction(student.name, "학습 현황 분석")}>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            학습 현황 분석
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

export default TeacherStudents;
