import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Download, FileText, CreditCard, Receipt } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";

const AdminRevenue = () => {
  const revenueByInstructor = [
    { name: "김교수", courses: 8, revenue: 8500000, growth: 15 },
    { name: "이강사", courses: 5, revenue: 5200000, growth: 12 },
    { name: "박선생", courses: 3, revenue: 3100000, growth: 8 },
    { name: "최개발", courses: 4, revenue: 2800000, growth: 10 },
  ];

  const recentTransactions = [
    { id: 1, student: "김학생", course: "React 완벽 가이드", amount: 150000, date: "2024-10-28", status: "completed" },
    { id: 2, student: "이수강", course: "파이썬 데이터 분석", amount: 120000, date: "2024-10-28", status: "completed" },
    { id: 3, student: "박공부", course: "디자인 시스템 구축", amount: 180000, date: "2024-10-27", status: "completed" },
    { id: 4, student: "정학습", course: "TypeScript 마스터클래스", amount: 165000, date: "2024-10-27", status: "pending" },
  ];

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">매출 관리</h1>
            <p className="text-muted-foreground mt-2">
              플랫폼의 수익과 정산을 관리하세요
            </p>
          </div>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            리포트 다운로드
          </Button>
        </div>

        {/* 매출 통계 */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                총 매출
              </CardTitle>
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-xl font-bold break-all">₩45,230,000</div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">+5.2% 전월 대비</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                이번 달 매출
              </CardTitle>
              <div className="h-10 w-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-xl font-bold break-all">₩12,450,000</div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">+12.3%</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                평균 거래액
              </CardTitle>
              <div className="h-10 w-10 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-5 w-5 text-secondary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-xl font-bold break-all">₩158,900</div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">거래당</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                총 거래 건수
              </CardTitle>
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-xl font-bold break-all">1,234</div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">이번 달 +89</p>
            </CardContent>
          </Card>
        </div>

        {/* 강사별 매출 */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>강사별 매출 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueByInstructor.map((instructor) => (
                <div
                  key={instructor.name}
                  className="flex items-center justify-between p-4 rounded-xl border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">
                        {instructor.name[0]}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{instructor.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {instructor.courses}개 강의
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-primary">
                      ₩{(instructor.revenue / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-xs text-green-600">
                      +{instructor.growth}% 증가
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 최근 거래 내역 */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>최근 거래 내역</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-xl border hover:border-primary/50 transition-colors"
                >
                  <div>
                    <h4 className="font-semibold">{transaction.course}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>{transaction.student}</span>
                      <span>·</span>
                      <span>{transaction.date}</span>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="font-bold text-lg">
                        ₩{transaction.amount.toLocaleString()}
                      </p>
                      <p
                        className={`text-xs ${
                          transaction.status === "completed"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {transaction.status === "completed" ? "완료" : "대기중"}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      상세
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 정산 정보 */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>정산 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground">다음 정산일</p>
                <p className="font-semibold text-lg mt-1">2024년 11월 5일</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">정산 예정 금액</p>
                <p className="font-bold text-xl text-primary mt-1">
                  ₩8,500,000
                </p>
              </div>
            </div>
            <Button className="w-full">정산 처리하기</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminRevenue;
