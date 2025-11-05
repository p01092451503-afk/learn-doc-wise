import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Download, FileText } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface Payment {
  id: string;
  created_at: string;
  amount: number;
  status: string;
  payment_method: string;
  course_title: string;
}

const StudentPaymentHistory = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 결제 테이블이 생성되면 실제 데이터 조회
      // 현재는 임시 데이터 표시
      const mockPayments: Payment[] = [
        {
          id: "pay-001",
          created_at: new Date().toISOString(),
          amount: 150000,
          status: "completed",
          payment_method: "card",
          course_title: "AI 기초: 인공지능 첫걸음"
        }
      ];
      
      setPayments(mockPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "오류",
        description: "결제 내역을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">결제 완료</Badge>;
      case "pending":
        return <Badge variant="secondary">결제 대기</Badge>;
      case "failed":
        return <Badge variant="destructive">결제 실패</Badge>;
      case "cancelled":
        return <Badge variant="outline">결제 취소</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethod = (method: string) => {
    switch (method) {
      case "card":
        return "신용/체크카드";
      case "transfer":
        return "계좌이체";
      case "virtual":
        return "가상계좌";
      default:
        return method;
    }
  };

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-primary" />
            결제 내역
          </h1>
          <p className="text-muted-foreground mt-2">
            강의 결제 내역 및 영수증을 확인하세요
          </p>
        </div>

        {/* 요약 통계 */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">총 결제 금액</p>
                  <p className="text-3xl font-bold mt-2">
                    ₩{payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                  </p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">결제 건수</p>
                  <p className="text-3xl font-bold mt-2">{payments.length}건</p>
                </div>
                <div className="h-12 w-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">이번 달 결제</p>
                  <p className="text-3xl font-bold mt-2">
                    ₩{payments.filter(p => {
                      const paymentDate = new Date(p.created_at);
                      const now = new Date();
                      return paymentDate.getMonth() === now.getMonth() && 
                             paymentDate.getFullYear() === now.getFullYear();
                    }).reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                  </p>
                </div>
                <div className="h-12 w-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 결제 내역 테이블 */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">결제 내역을 불러오는 중...</p>
                </div>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">결제 내역이 없습니다</h3>
                <p className="text-muted-foreground">
                  강의를 수강하면 결제 내역이 여기에 표시됩니다
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>결제일시</TableHead>
                    <TableHead>강의명</TableHead>
                    <TableHead>결제금액</TableHead>
                    <TableHead>결제수단</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">영수증</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {format(new Date(payment.created_at), "yyyy.MM.dd HH:mm", { locale: ko })}
                      </TableCell>
                      <TableCell className="font-medium">{payment.course_title}</TableCell>
                      <TableCell className="font-semibold">
                        ₩{payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{getPaymentMethod(payment.payment_method)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" disabled>
                          <Download className="h-4 w-4 mr-1" />
                          다운로드
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentPaymentHistory;
