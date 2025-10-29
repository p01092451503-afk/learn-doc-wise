import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, BookOpen, DollarSign, Activity } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";

const AdminAnalytics = () => {
  const monthlyData = [
    { month: "4월", revenue: 32000000, users: 1850, courses: 120 },
    { month: "5월", revenue: 35000000, users: 2100, courses: 128 },
    { month: "6월", revenue: 38000000, users: 2350, courses: 135 },
    { month: "7월", revenue: 40000000, users: 2550, courses: 142 },
    { month: "8월", revenue: 42000000, users: 2680, courses: 148 },
    { month: "9월", revenue: 43000000, users: 2780, courses: 152 },
    { month: "10월", revenue: 45230000, users: 2847, courses: 156 },
  ];

  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">분석</h1>
          <p className="text-muted-foreground mt-2">
            플랫폼의 성과와 트렌드를 분석하세요
          </p>
        </div>

        {/* 주요 지표 */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    총 매출
                  </p>
                  <p className="text-3xl font-bold overflow-x-auto scrollbar-hide">
                    ₩45,230,000
                  </p>
                  <p className="text-xs text-green-600">
                    +5.2% 전월 대비
                  </p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    신규 사용자
                  </p>
                  <p className="text-3xl font-bold">180</p>
                  <p className="text-xs text-green-600">
                    +12% 전월 대비
                  </p>
                </div>
                <div className="h-12 w-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    신규 강좌
                  </p>
                  <p className="text-3xl font-bold">12</p>
                  <p className="text-xs text-green-600">
                    +8.3% 전월 대비
                  </p>
                </div>
                <div className="h-12 w-12 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    활성 세션
                  </p>
                  <p className="text-3xl font-bold">1,234</p>
                  <p className="text-xs text-muted-foreground">
                    현재 접속 중
                  </p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 월별 매출 추이 */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              월별 매출 추이
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((item) => (
                <div key={item.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium w-12">{item.month}</span>
                    <span className="font-semibold text-primary">
                      ₩{(item.revenue / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="relative h-10 bg-muted rounded-lg overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary-glow rounded-lg transition-all duration-300"
                      style={{
                        width: `${(item.revenue / maxRevenue) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 사용자 증가 추이 */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                사용자 증가 추이
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map((item) => (
                  <div key={item.month} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium w-12">{item.month}</span>
                      <span className="font-semibold text-accent">
                        {item.users.toLocaleString()}명
                      </span>
                    </div>
                    <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-accent/70 rounded-lg transition-all duration-300"
                        style={{
                          width: `${(item.users / 3000) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 강좌 증가 추이 */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                강좌 증가 추이
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map((item) => (
                  <div key={item.month} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium w-12">{item.month}</span>
                      <span className="font-semibold text-secondary">
                        {item.courses}개
                      </span>
                    </div>
                    <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-secondary to-secondary/70 rounded-lg transition-all duration-300"
                        style={{
                          width: `${(item.courses / 200) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 카테고리별 분석 */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              카테고리별 인기도
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">프론트엔드</span>
                  <span className="font-semibold">45%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all duration-300"
                    style={{ width: "45%" }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">백엔드</span>
                  <span className="font-semibold">28%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-accent h-3 rounded-full transition-all duration-300"
                    style={{ width: "28%" }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">디자인</span>
                  <span className="font-semibold">18%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-secondary h-3 rounded-full transition-all duration-300"
                    style={{ width: "18%" }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">데이터 과학</span>
                  <span className="font-semibold">9%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all duration-300"
                    style={{ width: "9%" }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
