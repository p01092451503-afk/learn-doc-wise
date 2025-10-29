import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, UserPlus, Search, MoreVertical, Mail, Calendar, GraduationCap, UserCheck, Shield } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminUsers = () => {
  const students = [
    { id: 1, name: "김학생", email: "student1@example.com", courses: 3, joinDate: "2024-09-15", status: "active" },
    { id: 2, name: "이수강", email: "student2@example.com", courses: 5, joinDate: "2024-08-20", status: "active" },
    { id: 3, name: "박공부", email: "student3@example.com", courses: 2, joinDate: "2024-10-01", status: "active" },
  ];

  const teachers = [
    { id: 1, name: "김교수", email: "teacher1@example.com", courses: 8, students: 342, joinDate: "2023-05-10" },
    { id: 2, name: "이강사", email: "teacher2@example.com", courses: 5, students: 156, joinDate: "2023-08-15" },
    { id: 3, name: "박선생", email: "teacher3@example.com", courses: 3, students: 89, joinDate: "2024-01-20" },
  ];

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">사용자 관리</h1>
            <p className="text-muted-foreground mt-2">
              플랫폼의 모든 사용자를 관리하세요
            </p>
          </div>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            사용자 추가
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                전체 사용자
              </CardTitle>
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-xl font-bold break-all">2,847</div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">이번 달 +180</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                학생
              </CardTitle>
              <div className="h-10 w-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <GraduationCap className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-xl font-bold break-all">2,456</div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">86%</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                강사
              </CardTitle>
              <div className="h-10 w-10 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <UserCheck className="h-5 w-5 text-secondary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-xl font-bold break-all">342</div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">12%</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                관리자
              </CardTitle>
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-xl font-bold break-all">49</div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">2%</p>
            </CardContent>
          </Card>
        </div>

        {/* 검색 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="이름, 이메일로 검색..."
            className="pl-10 rounded-xl border-border/50"
          />
        </div>

        {/* 사용자 목록 */}
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="students">학생</TabsTrigger>
            <TabsTrigger value="teachers">강사</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="mt-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>학생 목록</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 rounded-xl border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {student.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{student.name}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {student.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {student.joinDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{student.courses}개 수강</p>
                          <Badge variant="default" className="mt-1">
                            {student.status === "active" ? "활성" : "비활성"}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>상세 보기</DropdownMenuItem>
                            <DropdownMenuItem>정보 수정</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              계정 정지
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers" className="mt-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>강사 목록</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="flex items-center justify-between p-4 rounded-xl border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-accent/10 text-accent font-semibold">
                            {teacher.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{teacher.name}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {teacher.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {teacher.joinDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p className="font-medium">{teacher.courses}개 강의</p>
                          <p className="text-muted-foreground">
                            {teacher.students}명 학생
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>상세 보기</DropdownMenuItem>
                            <DropdownMenuItem>정보 수정</DropdownMenuItem>
                            <DropdownMenuItem>강의 관리</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              계정 정지
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
