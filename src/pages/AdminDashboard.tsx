import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Users, BookOpen, DollarSign, Activity, TrendingUp, AlertCircle } from "lucide-react";

const AdminDashboard = () => {
  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">관리자 대시보드</h1>
          <p className="text-muted-foreground">플랫폼 전체를 관리하고 모니터링하세요</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="전체 사용자"
            value="2,847"
            icon={<Users className="h-4 w-4" />}
            description="+180 from last month"
            trend="up"
          />
          <StatsCard
            title="전체 강의"
            value="156"
            icon={<BookOpen className="h-4 w-4" />}
            description="+12 this month"
            trend="up"
          />
          <StatsCard
            title="총 매출"
            value="₩45,230,000"
            icon={<DollarSign className="h-4 w-4" />}
            description="+24% from last month"
            trend="up"
          />
          <StatsCard
            title="활성 세션"
            value="1,234"
            icon={<Activity className="h-4 w-4" />}
            description="현재 접속 중"
          />
        </div>

        {/* Platform Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">사용자 통계</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <StatRow label="학생" value="2,456" percentage={86} />
                <StatRow label="강사" value="342" percentage={12} />
                <StatRow label="관리자" value="49" percentage={2} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">강의 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <StatRow label="활성 강의" value="138" percentage={88} />
                <StatRow label="검토 대기" value="12" percentage={8} />
                <StatRow label="보관됨" value="6" percentage={4} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">수익 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">평균 구매액</span>
                  <span className="font-medium">₩158,900</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">전환율</span>
                  <span className="font-medium">3.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">환불율</span>
                  <span className="font-medium">1.8%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Alerts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>최근 활동</CardTitle>
              <CardDescription>플랫폼의 최근 주요 활동</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ActivityLog
                  type="user"
                  message="새 강사 등록: 김교수"
                  time="5분 전"
                />
                <ActivityLog
                  type="course"
                  message="강의 승인: Advanced Machine Learning"
                  time="15분 전"
                />
                <ActivityLog
                  type="payment"
                  message="결제 완료: ₩450,000"
                  time="30분 전"
                />
                <ActivityLog
                  type="user"
                  message="대량 회원가입: 25명 (ABC 대학교)"
                  time="1시간 전"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                알림 및 경고
              </CardTitle>
              <CardDescription>주의가 필요한 항목</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AlertItem
                  level="warning"
                  title="검토 대기 중인 강의"
                  description="12개의 강의가 승인을 기다리고 있습니다"
                  action="검토하기"
                />
                <AlertItem
                  level="info"
                  title="서버 사용량 증가"
                  description="지난 주 대비 35% 증가"
                  action="확인"
                />
                <AlertItem
                  level="warning"
                  title="환불 요청"
                  description="3건의 환불 요청이 처리 대기 중"
                  action="처리하기"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Users className="h-5 w-5" />
                사용자 추가
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <BookOpen className="h-5 w-5" />
                강의 승인
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <DollarSign className="h-5 w-5" />
                정산 처리
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <TrendingUp className="h-5 w-5" />
                리포트 생성
              </Button>
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
  description, 
  trend 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  description: string; 
  trend?: "up" | "down";
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className={`text-xs ${trend === "up" ? "text-green-600" : "text-muted-foreground"}`}>
        {description}
      </p>
    </CardContent>
  </Card>
);

const StatRow = ({ label, value, percentage }: { label: string; value: string; percentage: number }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
    <div className="w-full bg-muted rounded-full h-2">
      <div 
        className="bg-primary h-2 rounded-full transition-all duration-300" 
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
);

const ActivityLog = ({ type, message, time }: { type: string; message: string; time: string }) => (
  <div className="flex items-start gap-3">
    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
      <div className="h-2 w-2 rounded-full bg-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm">{message}</p>
      <p className="text-xs text-muted-foreground">{time}</p>
    </div>
  </div>
);

const AlertItem = ({ 
  level, 
  title, 
  description, 
  action 
}: { 
  level: "info" | "warning"; 
  title: string; 
  description: string; 
  action: string;
}) => (
  <div className="flex items-start justify-between p-3 rounded-lg border">
    <div className="flex-1">
      <h4 className="text-sm font-medium mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <Button size="sm" variant={level === "warning" ? "destructive" : "outline"}>
      {action}
    </Button>
  </div>
);

export default AdminDashboard;
