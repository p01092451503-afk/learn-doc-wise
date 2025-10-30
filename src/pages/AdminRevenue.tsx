import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { DollarSign, TrendingUp, CreditCard, Calendar, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Payment {
  id: string;
  tenant_id: string;
  amount: number;
  status: string;
  payment_method: string | null;
  invoice_number: string | null;
  paid_at: string | null;
  created_at: string;
}

interface RevenueStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalTransactions: number;
  avgTransactionValue: number;
}

const AdminRevenue = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalTransactions: 0,
    avgTransactionValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      const allPayments = data || [];
      setPayments(allPayments);

      const now = new Date();
      const thisMonth = allPayments.filter(p => {
        const paymentDate = new Date(p.created_at);
        return paymentDate.getMonth() === now.getMonth() && 
               paymentDate.getFullYear() === now.getFullYear();
      });

      const totalRevenue = allPayments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

      const monthlyRevenue = thisMonth
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

      const completedCount = allPayments.filter(p => p.status === 'completed').length;

      setStats({
        totalRevenue,
        monthlyRevenue,
        totalTransactions: allPayments.length,
        avgTransactionValue: completedCount > 0 ? totalRevenue / completedCount : 0,
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "결제 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
      refunded: "secondary",
    };
    const labels: Record<string, string> = {
      completed: "완료",
      pending: "대기",
      failed: "실패",
      refunded: "환불",
    };
    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">매출 관리</h1>
            <p className="text-muted-foreground mt-2">플랫폼 매출 현황 및 정산 관리</p>
          </div>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            리포트 다운로드
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 매출</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₩{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">누적 매출</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">이번 달 매출</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₩{stats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">이번 달 매출</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 거래액</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₩{Math.round(stats.avgTransactionValue).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">평균 거래액</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 거래 건수</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">총 거래 건수</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>최근 거래내역</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>거래 ID</TableHead>
                  <TableHead>청구서 번호</TableHead>
                  <TableHead>금액</TableHead>
                  <TableHead>결제 수단</TableHead>
                  <TableHead>결제일</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-sm">
                      {payment.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>{payment.invoice_number || "-"}</TableCell>
                    <TableCell className="font-medium">
                      ₩{parseFloat(payment.amount.toString()).toLocaleString()}
                    </TableCell>
                    <TableCell>{payment.payment_method || "-"}</TableCell>
                    <TableCell>
                      {payment.paid_at 
                        ? new Date(payment.paid_at).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>정산 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground">다음 정산일</p>
                <p className="font-semibold text-lg mt-1">
                  {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">정산 예정 금액</p>
                <p className="font-bold text-xl text-primary mt-1">
                  ₩{stats.monthlyRevenue.toLocaleString()}
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
