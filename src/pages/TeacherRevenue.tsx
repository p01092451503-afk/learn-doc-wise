import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { DollarSign, TrendingUp, CreditCard, Download, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TeacherRevenue = () => {
  const revenueData = [
    { month: "10월", revenue: 4250000, students: 342, courses: 8 },
    { month: "9월", revenue: 3600000, students: 320, courses: 7 },
    { month: "8월", revenue: 3200000, students: 298, courses: 7 },
    { month: "7월", revenue: 2950000, students: 275, courses: 6 },
    { month: "6월", revenue: 2680000, students: 256, courses: 6 },
    { month: "5월", revenue: 2450000, students: 234, courses: 5 },
  ];

  const transactions = [
    {
      id: 1,
      date: "2024-10-28",
      course: "React 완벽 가이드",
      student: "김철수",
      amount: 150000,
      status: "completed",
    },
    {
      id: 2,
      date: "2024-10-27",
      course: "TypeScript 마스터클래스",
      student: "이영희",
      amount: 120000,
      status: "completed",
    },
    {
      id: 3,
      date: "2024-10-27",
      course: "Next.js 풀스택 개발",
      student: "박지민",
      amount: 180000,
      status: "completed",
    },
    {
      id: 4,
      date: "2024-10-26",
      course: "React 완벽 가이드",
      student: "정민수",
      amount: 150000,
      status: "pending",
    },
    {
      id: 5,
      date: "2024-10-26",
      course: "TypeScript 마스터클래스",
      student: "최수진",
      amount: 120000,
      status: "completed",
    },
  ];

  return (
    <DashboardLayout userRole="teacher">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">수익 관리</h1>
            <p className="text-muted-foreground">
              수익 현황과 거래 내역을 확인하세요
            </p>
          </div>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            수익 리포트 다운로드
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title="이번 달 수익"
            value="₩4,250,000"
            icon={<DollarSign className="h-4 w-4" />}
            description="+18% from last month"
            trend="up"
          />
          <StatsCard
            title="총 누적 수익"
            value="₩19,130,000"
            icon={<TrendingUp className="h-4 w-4" />}
            description="최근 6개월"
          />
          <StatsCard
            title="평균 강의당 수익"
            value="₩531,250"
            icon={<CreditCard className="h-4 w-4" />}
            description="활성 강의 기준"
          />
          <StatsCard
            title="정산 예정"
            value="₩720,000"
            icon={<Calendar className="h-4 w-4" />}
            description="11월 1일"
          />
        </div>

        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>월별 수익 추이</CardTitle>
            <CardDescription>최근 6개월간의 수익 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueData.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{data.month}</span>
                      <span className="text-lg font-bold">₩{data.revenue.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(data.revenue / 4250000) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{data.students} 학생</span>
                      <span>•</span>
                      <span>{data.courses}개 강의</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>최근 거래 내역</CardTitle>
            <CardDescription>최근 수강 결제 내역</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>날짜</TableHead>
                  <TableHead>강의명</TableHead>
                  <TableHead>학생</TableHead>
                  <TableHead className="text-right">금액</TableHead>
                  <TableHead className="text-right">상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {transaction.date}
                    </TableCell>
                    <TableCell className="font-medium">{transaction.course}</TableCell>
                    <TableCell>{transaction.student}</TableCell>
                    <TableCell className="text-right font-medium">
                      ₩{transaction.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {transaction.status === "completed" ? "완료" : "대기중"}
                      </span>
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
  description,
  trend 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  description: string;
  trend?: "up" | "down";
}) => (
  <Card className="overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium whitespace-nowrap">{title}</CardTitle>
      <div className="text-muted-foreground flex-shrink-0">{icon}</div>
    </CardHeader>
    <CardContent className="space-y-1 min-w-0">
      <div className="text-xl font-bold break-all">{value}</div>
      <p className={`text-xs whitespace-nowrap ${trend === "up" ? "text-green-600" : "text-muted-foreground"}`}>
        {description}
      </p>
    </CardContent>
  </Card>
);

export default TeacherRevenue;
