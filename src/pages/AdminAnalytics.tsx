import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, BookOpen, DollarSign, Activity, Eye, Clock } from "lucide-react";
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                총 방문자
              </CardTitle>
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-xl font-bold break-all">45,230</div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">+12.5% 전월 대비</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                페이지뷰
              </CardTitle>
              <div className="h-10 w-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Eye className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-xl font-bold break-all">128,450</div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">평균 2.8 페이지/세션</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                평균 세션 시간
              </CardTitle>
              <div className="h-10 w-10 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-secondary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-xl font-bold break-all">5:32</div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">+0:45 증가</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                전환율
              </CardTitle>
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-xl font-bold break-all">3.2%</div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">+0.5% 증가</p>
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
