import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, Receipt, Calendar } from "lucide-react";
import { AtomLoader } from "@/components/AtomLoader";

interface BillingRecord {
  id: string;
  invoice_number: string;
  billing_date: string;
  amount: number;
  status: string;
  payment_method: string;
  plan_name: string;
  billing_period_start: string;
  billing_period_end: string;
}

interface BillingHistoryProps {
  tenantId: string;
}

const BillingHistory = ({ tenantId }: BillingHistoryProps) => {
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBillingHistory();
  }, [tenantId]);

  const fetchBillingHistory = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("billing_history")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("billing_date", { ascending: false });

      if (error) throw error;

      setBillingRecords(data || []);
    } catch (error: any) {
      console.error("Error fetching billing history:", error);
      toast({
        title: "오류",
        description: "청구 내역을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="default">결제완료</Badge>;
      case "pending":
        return <Badge variant="secondary">대기중</Badge>;
      case "failed":
        return <Badge variant="destructive">실패</Badge>;
      case "refunded":
        return <Badge variant="outline">환불됨</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ko-KR");
  };

  const formatAmount = (amount: number) => {
    return `₩${amount.toLocaleString()}`;
  };

  const handleDownloadInvoice = async (invoiceNumber: string) => {
    toast({
      title: "청구서 다운로드",
      description: "청구서를 다운로드합니다...",
    });
    // TODO: Implement invoice download functionality
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <AtomLoader />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              청구 내역
            </CardTitle>
            <CardDescription>
              전체 결제 및 청구 내역을 확인하세요
            </CardDescription>
          </div>
          <Button variant="outline" onClick={fetchBillingHistory}>
            새로고침
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {billingRecords.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>청구 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>청구서 번호</TableHead>
                  <TableHead>청구일</TableHead>
                  <TableHead>플랜</TableHead>
                  <TableHead>청구 기간</TableHead>
                  <TableHead>금액</TableHead>
                  <TableHead>결제수단</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono text-sm">
                      {record.invoice_number}
                    </TableCell>
                    <TableCell>{formatDate(record.billing_date)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.plan_name}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDate(record.billing_period_start)} -{" "}
                          {formatDate(record.billing_period_end)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatAmount(record.amount)}
                    </TableCell>
                    <TableCell>{record.payment_method}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadInvoice(record.invoice_number)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BillingHistory;
