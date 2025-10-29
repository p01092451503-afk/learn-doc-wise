import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Plus, Search, Eye, Edit, Trash2, Users } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";

const AdminCourses = () => {
  const activeCourses = [
    {
      id: 1,
      title: "React 완벽 가이드",
      instructor: "김교수",
      students: 145,
      rating: 4.9,
      category: "프론트엔드",
      revenue: "₩1,450,000",
      status: "active",
    },
    {
      id: 2,
      title: "파이썬 데이터 분석",
      instructor: "이강사",
      students: 98,
      rating: 4.7,
      category: "데이터 과학",
      revenue: "₩980,000",
      status: "active",
    },
    {
      id: 3,
      title: "디자인 시스템 구축",
      instructor: "박선생",
      students: 76,
      rating: 4.8,
      category: "디자인",
      revenue: "₩760,000",
      status: "active",
    },
  ];

  const pendingCourses = [
    {
      id: 4,
      title: "Vue.js 마스터클래스",
      instructor: "최개발",
      submittedDate: "2024-10-28",
      category: "프론트엔드",
    },
    {
      id: 5,
      title: "UI/UX 디자인 심화",
      instructor: "정디자인",
      submittedDate: "2024-10-27",
      category: "디자인",
    },
  ];

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">강좌 관리</h1>
            <p className="text-muted-foreground mt-2">
              플랫폼의 모든 강좌를 관리하고 승인하세요
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            강좌 추가
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                전체 강좌
              </CardTitle>
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-3xl font-bold whitespace-nowrap overflow-x-auto scrollbar-hide">156</div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">이번 달 +12</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                활성 강좌
              </CardTitle>
              <div className="h-10 w-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-3xl font-bold whitespace-nowrap overflow-x-auto scrollbar-hide">138</div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">전체의 88%</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                검토 대기
              </CardTitle>
              <div className="h-10 w-10 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 text-secondary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-3xl font-bold whitespace-nowrap overflow-x-auto scrollbar-hide">12</div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">승인 필요</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                총 수강생
              </CardTitle>
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-3xl font-bold whitespace-nowrap overflow-x-auto scrollbar-hide">2,456</div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">평균 18명/강좌</p>
            </CardContent>
          </Card>
        </div>

        {/* 검색 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="강좌명, 강사명으로 검색..."
            className="pl-10 rounded-xl border-border/50"
          />
        </div>

        {/* 강좌 목록 */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="active">활성 강좌</TabsTrigger>
            <TabsTrigger value="pending">검토 대기</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeCourses.map((course) => (
                <Card
                  key={course.id}
                  className="border-border/50 shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <Badge variant="secondary">{course.category}</Badge>
                        <CardTitle className="text-lg mt-2">
                          {course.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {course.instructor}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">수강생</p>
                        <p className="font-semibold">{course.students}명</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">평점</p>
                        <p className="font-semibold">⭐ {course.rating}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">수익</p>
                        <p className="font-semibold text-primary">
                          {course.revenue}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        보기
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        수정
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>승인 대기 중인 강좌</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-4 rounded-xl border hover:border-primary/50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{course.category}</Badge>
                          <Badge variant="outline">검토 대기</Badge>
                        </div>
                        <h4 className="font-semibold text-lg">{course.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {course.instructor} · 제출일: {course.submittedDate}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          검토
                        </Button>
                        <Button size="sm">승인</Button>
                        <Button size="sm" variant="destructive">
                          반려
                        </Button>
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

export default AdminCourses;
