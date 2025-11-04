import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings,
  GraduationCap,
  FileText,
  Calendar,
  TrendingUp,
  Award,
  Bell,
  DollarSign,
  Shield,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminDemo = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // 데모 데이터
  const stats = {
    totalUsers: 1247,
    activeCourses: 38,
    totalRevenue: 45680000,
    completionRate: 87.5,
    newEnrollments: 156,
    satisfactionScore: 4.6
  };

  const recentActivities = [
    { id: 1, type: "enrollment", user: "김철수", course: "AI 기반 웹 개발", time: "5분 전" },
    { id: 2, type: "completion", user: "이영희", course: "데이터 분석 실무", time: "12분 전" },
    { id: 3, type: "question", user: "박지훈", course: "Python 기초", time: "23분 전" },
    { id: 4, type: "payment", user: "최민지", course: "UI/UX 디자인", time: "1시간 전" }
  ];

  const topCourses = [
    { id: 1, title: "AI 기반 웹 개발 완성 과정", students: 234, rating: 4.8, revenue: 12500000 },
    { id: 2, title: "데이터 분석 실무", students: 189, rating: 4.7, revenue: 9800000 },
    { id: 3, title: "Python 프로그래밍 기초", students: 312, rating: 4.9, revenue: 8900000 }
  ];

  const features = [
    {
      icon: Users,
      title: "사용자 관리",
      description: "학생, 강사, 관리자 통합 관리",
      color: "text-blue-600"
    },
    {
      icon: BookOpen,
      title: "강좌 관리",
      description: "강좌 생성, 수정, 승인 시스템",
      color: "text-green-600"
    },
    {
      icon: BarChart3,
      title: "분석 대시보드",
      description: "실시간 학습 데이터 분석",
      color: "text-purple-600"
    },
    {
      icon: DollarSign,
      title: "수익 관리",
      description: "정산 및 매출 통계",
      color: "text-yellow-600"
    },
    {
      icon: Calendar,
      title: "출결 관리",
      description: "자동 출결 체크 시스템",
      color: "text-red-600"
    },
    {
      icon: Award,
      title: "게이미피케이션",
      description: "배지, 포인트, 리더보드",
      color: "text-indigo-600"
    },
    {
      icon: Zap,
      title: "AI 기능",
      description: "AI 튜터, 자동 채점, 분석",
      color: "text-pink-600"
    },
    {
      icon: Shield,
      title: "시스템 모니터링",
      description: "헬스 체크 및 알림",
      color: "text-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  교육 플랫폼 관리자
                </h1>
                <p className="text-sm text-muted-foreground">통합 관리 시스템 데모</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              데모 모드
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* 데모 안내 */}
        <Card className="mb-8 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">관리자 기능 데모</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  이 페이지는 교육 플랫폼의 관리자 기능을 체험할 수 있는 데모 환경입니다. 
                  실제 데이터는 사용되지 않으며, 모든 기능을 자유롭게 둘러보실 수 있습니다.
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => navigate('/admin/dashboard')}>
                    전체 기능 둘러보기
                  </Button>
                  <Button variant="outline" onClick={() => window.open('https://docs.lovable.dev', '_blank')}>
                    문서 보기
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="features">주요 기능</TabsTrigger>
            <TabsTrigger value="stats">통계</TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-6">
            {/* 주요 지표 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 text-green-600" /> +12.5% 전월 대비
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">운영 중인 강좌</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeCourses}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 text-green-600" /> +5개 신규 개설
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">총 수익</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₩{(stats.totalRevenue / 10000).toFixed(0)}만</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 text-green-600" /> +18.2% 전월 대비
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 최근 활동 */}
            <Card>
              <CardHeader>
                <CardTitle>최근 활동</CardTitle>
                <CardDescription>실시간으로 업데이트되는 플랫폼 활동</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          activity.type === 'enrollment' ? 'bg-blue-100' :
                          activity.type === 'completion' ? 'bg-green-100' :
                          activity.type === 'question' ? 'bg-yellow-100' : 'bg-purple-100'
                        }`}>
                          {activity.type === 'enrollment' && <Users className="h-5 w-5 text-blue-600" />}
                          {activity.type === 'completion' && <Award className="h-5 w-5 text-green-600" />}
                          {activity.type === 'question' && <FileText className="h-5 w-5 text-yellow-600" />}
                          {activity.type === 'payment' && <DollarSign className="h-5 w-5 text-purple-600" />}
                        </div>
                        <div>
                          <p className="font-medium">{activity.user}</p>
                          <p className="text-sm text-muted-foreground">{activity.course}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 인기 강좌 */}
            <Card>
              <CardHeader>
                <CardTitle>인기 강좌 TOP 3</CardTitle>
                <CardDescription>수강생 수 기준</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCourses.map((course, index) => (
                    <div key={course.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                      <div className="flex-1">
                        <p className="font-medium">{course.title}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-muted-foreground">
                            👥 {course.students}명
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ⭐ {course.rating}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            💰 ₩{(course.revenue / 10000).toFixed(0)}만
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 주요 기능 탭 */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${
                        feature.color === 'text-blue-600' ? 'from-blue-100 to-blue-200' :
                        feature.color === 'text-green-600' ? 'from-green-100 to-green-200' :
                        feature.color === 'text-purple-600' ? 'from-purple-100 to-purple-200' :
                        feature.color === 'text-yellow-600' ? 'from-yellow-100 to-yellow-200' :
                        feature.color === 'text-red-600' ? 'from-red-100 to-red-200' :
                        feature.color === 'text-indigo-600' ? 'from-indigo-100 to-indigo-200' :
                        feature.color === 'text-pink-600' ? 'from-pink-100 to-pink-200' :
                        'from-orange-100 to-orange-200'
                      } flex items-center justify-center mb-3`}>
                        <Icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <CardTitle className="text-base">{feature.title}</CardTitle>
                      <CardDescription className="text-sm">{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>전체 기능 목록</CardTitle>
                <CardDescription>관리자가 사용할 수 있는 모든 기능</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2">
                  {[
                    "사용자 계정 관리 및 권한 설정",
                    "강좌 생성, 수정, 삭제, 승인",
                    "실시간 학습 분석 대시보드",
                    "매출 및 정산 관리",
                    "출결 관리 및 통계",
                    "게이미피케이션 설정",
                    "AI 기능 모니터링",
                    "시스템 헬스 체크",
                    "알림 설정 및 관리",
                    "백업 및 복구 관리",
                    "테넌트 관리",
                    "라이선스 관리"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2">
                      <div className="h-2 w-2 bg-primary rounded-full" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 통계 탭 */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">이번 달 신규 수강생</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{stats.newEnrollments}</div>
                  <p className="text-xs text-muted-foreground mt-1">목표 대비 112% 달성</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">평균 수료율</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{stats.completionRate}%</div>
                  <p className="text-xs text-muted-foreground mt-1">업계 평균 대비 +15%</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">만족도 점수</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{stats.satisfactionScore} / 5.0</div>
                  <p className="text-xs text-muted-foreground mt-1">1,234개 리뷰 기준</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>월별 성장 추이</CardTitle>
                <CardDescription>최근 6개월 데이터</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2">
                  {[65, 78, 85, 92, 88, 95].map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-gradient-to-t from-blue-600 to-indigo-600 rounded-t"
                        style={{ height: `${value}%` }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {index + 1}월
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <Card className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 border-0 text-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">관리자 기능을 직접 체험해보세요</h2>
              <p className="text-blue-100 mb-6">
                전체 관리자 대시보드에서 모든 기능을 자유롭게 사용해보실 수 있습니다
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate('/admin/dashboard')}
                className="font-semibold"
              >
                관리자 대시보드 시작하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDemo;