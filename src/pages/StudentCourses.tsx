import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, PlayCircle, CheckCircle2 } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";

const StudentCourses = () => {
  const courses = [
    {
      id: 1,
      title: "React 완벽 가이드",
      instructor: "김철수",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
      progress: 65,
      totalLessons: 24,
      completedLessons: 16,
      lastWatched: "컴포넌트 생명주기",
      duration: "12시간",
      category: "프론트엔드",
    },
    {
      id: 2,
      title: "파이썬 데이터 분석",
      instructor: "이영희",
      thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400",
      progress: 40,
      totalLessons: 20,
      completedLessons: 8,
      lastWatched: "Pandas 기초",
      duration: "10시간",
      category: "데이터 과학",
    },
    {
      id: 3,
      title: "디자인 시스템 구축",
      instructor: "박민수",
      thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400",
      progress: 25,
      totalLessons: 16,
      completedLessons: 4,
      lastWatched: "컬러 시스템 설계",
      duration: "8시간",
      category: "디자인",
    },
  ];

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">내 강의</h1>
          <p className="text-muted-foreground mt-2">
            수강 중인 강의를 확인하고 학습을 이어가세요
          </p>
        </div>

        {/* 학습 진행 현황 */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    수강 중인 강의
                  </p>
                  <p className="text-3xl font-bold mt-2">3</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    완료한 레슨
                  </p>
                  <p className="text-3xl font-bold mt-2">28</p>
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
                    총 학습 시간
                  </p>
                  <p className="text-3xl font-bold mt-2">30시간</p>
                </div>
                <div className="h-12 w-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 수강 중인 강의 목록 */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">수강 중인 강의</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm">
                    {course.category}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {course.instructor}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">진행률</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {course.completedLessons}/{course.totalLessons} 레슨 완료
                    </p>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-3">
                      마지막 학습: {course.lastWatched}
                    </p>
                    <Button className="w-full gap-2">
                      <PlayCircle className="h-4 w-4" />
                      이어서 학습하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentCourses;
